<?php

namespace App\Http\Controllers;

use App\Models\PropertyInquiry;
use App\Models\SellerPropertyDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyInquiryController extends Controller
{
    public function store(Request $request, int $propertyId): JsonResponse
    {
        $property = SellerPropertyDraft::where('status', 'published')->findOrFail($propertyId);

        $data = $request->validate([
            'buyer_id' => 'nullable|exists:users,id',
            'buyer_name' => 'required|string|max:120',
            'buyer_email' => 'required|email|max:160',
            'buyer_phone' => 'nullable|string|max:30',
            'message' => 'nullable|string|max:1500',
        ]);

        $inquiry = PropertyInquiry::create([
            ...$data,
            'seller_property_draft_id' => $property->id,
            'seller_id' => $property->seller_id,
            'is_site_visit' => false,
            'status' => 'new',
        ]);

        if ($property->seller_id) {
            NotificationController::send(
                $property->seller_id,
                'New Buyer Inquiry 📩',
                "{$data['buyer_name']} inquired about your listing '{$property->property_type} in {$property->district}'. Phone: " . ($data['buyer_phone'] ?: 'Not provided'),
                'inquiry',
                '/seller-dashboard'
            );
        }

        NotificationController::notifyAdmins(
            'New Property Inquiry 📩',
            "{$data['buyer_name']} submitted an inquiry on Property #{$property->id} ({$property->district}).",
            'inquiry',
            '/admin'
        );

        return response()->json([
            'message' => 'Your inquiry was sent. The seller or KNW PRO REALTOR team will contact you soon.',
            'data' => $inquiry->load('property:id,property_type,district,expected_price'),
        ], 201);
    }

    public function bookSiteVisit(Request $request, int $propertyId): JsonResponse
    {
        $property = SellerPropertyDraft::where('status', 'published')->findOrFail($propertyId);

        $data = $request->validate([
            'buyer_id' => 'nullable|exists:users,id',
            'buyer_name' => 'required|string|max:120',
            'buyer_email' => 'required|email|max:160',
            'buyer_phone' => 'required|string|max:30',
            'visit_date' => 'required|date|after_or_equal:today',
            'visit_slot' => 'required|string|max:80',
            'message' => 'nullable|string|max:1000',
        ]);

        $inquiry = PropertyInquiry::create([
            'seller_property_draft_id' => $property->id,
            'seller_id' => $property->seller_id,
            'buyer_id' => $data['buyer_id'] ?? null,
            'buyer_name' => $data['buyer_name'],
            'buyer_email' => $data['buyer_email'],
            'buyer_phone' => $data['buyer_phone'],
            'message' => $data['message'] ?? 'Physical site inspection requested.',
            'is_site_visit' => true,
            'visit_date' => $data['visit_date'],
            'visit_slot' => $data['visit_slot'],
            'visit_status' => 'pending',
            'status' => 'new',
        ]);

        if ($property->seller_id) {
            NotificationController::send(
                $property->seller_id,
                'Physical Site Visit Requested! 📅',
                "{$data['buyer_name']} requested a physical on-site inspection for '{$property->property_type} in {$property->district}' on {$data['visit_date']} ({$data['visit_slot']}). Phone: {$data['buyer_phone']}",
                'inquiry',
                '/seller-dashboard'
            );
        }

        NotificationController::notifyAdmins(
            'New Site Inspection Scheduled 📅',
            "Inspection requested on Property #{$property->id} by {$data['buyer_name']} for {$data['visit_date']}.",
            'inquiry',
            '/admin'
        );

        return response()->json([
            'message' => 'Your site inspection has been requested! The seller has been notified to confirm the appointment.',
            'data' => $inquiry->load('property:id,property_type,district,expected_price,contact_number'),
        ], 201);
    }

    public function buyerInquiries(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id');
        $email = $request->query('email');

        $inquiries = PropertyInquiry::with([
            'property:id,property_type,district,expected_price,contact_number,property_images,location_url',
            'seller:id,name,email,phone',
        ])
            ->when($userId, fn ($q) => $q->where('buyer_id', $userId))
            ->when(! $userId && $email, fn ($q) => $q->where('buyer_email', $email))
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                if ($item->property && is_array($item->property->property_images)) {
                    $item->property->image_url = collect($item->property->property_images)
                        ->map(fn ($path) => Storage::disk('public')->url($path))
                        ->first();
                }
                return $item;
            });

        return response()->json(['data' => $inquiries]);
    }

    public function updateSiteVisit(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'visit_status' => 'required|in:pending,confirmed,rescheduled,completed,cancelled',
            'reschedule_date' => 'nullable|date',
            'reschedule_slot' => 'nullable|string|max:80',
            'seller_note' => 'nullable|string|max:1000',
        ]);

        $inquiry = PropertyInquiry::with('property')->findOrFail($id);
        $inquiry->update($data);

        if ($inquiry->buyer_id) {
            $propTitle = "{$inquiry->property?->property_type} in {$inquiry->property?->district}";
            if ($data['visit_status'] === 'confirmed') {
                NotificationController::send(
                    $inquiry->buyer_id,
                    'Site Inspection Confirmed! 🏡',
                    "Seller confirmed your physical visit for '{$propTitle}' on " . ($inquiry->visit_date?->toDateString()) . " ({$inquiry->visit_slot}). Check your buyer hub for details.",
                    'inquiry',
                    '/buyer-dashboard'
                );
            } elseif ($data['visit_status'] === 'rescheduled') {
                NotificationController::send(
                    $inquiry->buyer_id,
                    'Site Inspection Rescheduled 📅',
                    "Seller proposed a revised visit date for '{$propTitle}' on " . ($inquiry->reschedule_date?->toDateString()) . " ({$inquiry->reschedule_slot}). Note: " . ($inquiry->seller_note ?: 'None'),
                    'inquiry',
                    '/buyer-dashboard'
                );
            }
        }

        return response()->json([
            'message' => 'Site inspection appointment updated.',
            'data' => $inquiry->fresh()->load('property:id,property_type,district,expected_price,contact_number'),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $inquiries = PropertyInquiry::with([
            'property:id,property_type,district,expected_price,contact_number,seller_name,seller_email',
            'seller:id,name,email',
        ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $inquiries]);
    }

    public function sellerIndex(Request $request): JsonResponse
    {
        $sellerId = $request->integer('seller_id');
        $sellerEmail = $request->query('seller_email');

        $inquiries = PropertyInquiry::with('property:id,seller_id,seller_email,property_type,district,expected_price,status,contact_number')
            ->whereHas('property', function ($query) use ($sellerId, $sellerEmail) {
                $query
                    ->when($sellerId, fn ($q) => $q->where('seller_id', $sellerId))
                    ->when(! $sellerId && $sellerEmail, fn ($q) => $q->where('seller_email', $sellerEmail));
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $inquiries]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,contacted,closed',
            'admin_note' => 'nullable|string|max:1000',
            'seller_note' => 'nullable|string|max:1000',
        ]);

        $inquiry = PropertyInquiry::findOrFail($id);
        $inquiry->update($data);

        return response()->json([
            'message' => 'Inquiry updated.',
            'data' => $inquiry->fresh()->load('property:id,property_type,district,expected_price'),
        ]);
    }
}
