<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\SellerPropertyDraft;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerPropertyDraftController extends Controller
{
    private const LISTING_PLANS = [
        'basic' => 500,
        'verified' => 1000,
        'featured' => 2500,
    ];

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'property_type' => 'required|string|max:80',
            'district' => 'required|string|max:80',
            'expected_price' => 'required|string|max:80',
            'contact_number' => 'required|string|max:30',
            'description' => 'nullable|string|max:2000',
            'preferred_visit_date' => 'nullable|date',
            'visit_dates' => 'nullable|array',
            'visit_dates.*' => 'date',
            'visit_days' => 'nullable|array',
            'visit_days.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'visit_time' => 'nullable|string|max:40',
            'location_url' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'documents' => 'nullable|array',
            'documents.*' => 'string|max:120',
            'deed_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'survey_plan' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'council_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'other_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'property_images' => 'nullable|array|max:8',
            'property_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            'listing_plan' => 'required|in:basic,verified,featured',
            'payment_method' => 'required|string|max:60',
            'payment_reference' => 'required_unless:payment_method,Online card payment|string|nullable|max:120',
            'payment_slip' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'payment_note' => 'nullable|string|max:500',
            'terms_accepted' => 'accepted',
            'visit_permission' => 'accepted',
            'review_acknowledged' => 'accepted',
        ]);

        $imagePaths = [];
        foreach ($request->file('property_images', []) as $image) {
            $imagePaths[] = $image->store('property-images', 'public');
        }

        $paymentSlipPath = $request->hasFile('payment_slip')
            ? $request->file('payment_slip')->store('payment-slips', 'public')
            : null;

        // Legal Document Uploads
        $deedPath = $request->hasFile('deed_document')
            ? $request->file('deed_document')->store('property-documents', 'public')
            : null;
        $surveyPath = $request->hasFile('survey_plan')
            ? $request->file('survey_plan')->store('property-documents', 'public')
            : null;
        $councilPath = $request->hasFile('council_document')
            ? $request->file('council_document')->store('property-documents', 'public')
            : null;
        $otherPath = $request->hasFile('other_document')
            ? $request->file('other_document')->store('property-documents', 'public')
            : null;

        $hasLegalDocs = (bool) ($deedPath || $surveyPath || $councilPath || $otherPath);
        $legalStatus = $hasLegalDocs ? 'submitted_for_review' : 'no_documents';

        $docsList = [];
        if ($deedPath) $docsList[] = 'Title Deed / Extract Copy';
        if ($surveyPath) $docsList[] = 'Registered Survey Plan';
        if ($councilPath) $docsList[] = 'Local Council Non-Vesting / Street Line Clearance';
        if ($otherPath) $docsList[] = 'Supporting Legal Documentation';

        $user = auth()->user();
        if (! $user && $request->filled('seller_id')) {
            $user = User::find($request->integer('seller_id'));
        }

        if (! $user) {
            return response()->json([
                'message' => 'You must be signed in with a registered seller account to submit property listings and documents.',
            ], 401);
        }

        if (! $user->canListProperty()) {
            $msg = $user->seller_status === 'pending' || ($user->role === 'seller' && $user->isPending())
                ? 'Your seller verification is currently pending admin review. You will be able to post listings as soon as admin approves your identity documents.'
                : ($user->seller_status === 'rejected' || ($user->role === 'seller' && $user->isRejected())
                    ? 'Your seller application was not approved. Reason: ' . ($user->rejection_reason ?: 'Identity verification failed.')
                    : 'Please submit your seller verification (NIC / identity details) to activate seller privileges on your account.');

            return response()->json([
                'message' => $msg,
            ], 403);
        }

        $sellerId = $user->id;
        $sellerName = $user->name;
        $sellerEmail = $user->email;

        $draft = SellerPropertyDraft::create([
            ...$data,
            'seller_id' => $sellerId,
            'seller_name' => $sellerName,
            'seller_email' => $sellerEmail,
            'preferred_visit_date' => $data['visit_dates'][0] ?? $data['preferred_visit_date'] ?? null,
            'property_images' => $imagePaths,
            'payment_slip_path' => $paymentSlipPath,
            'deed_document_path' => $deedPath,
            'survey_plan_path' => $surveyPath,
            'council_document_path' => $councilPath,
            'other_document_path' => $otherPath,
            'documents' => $docsList,
            'legal_status' => $legalStatus,
            'is_deed_verified' => false,
            'listing_fee' => self::LISTING_PLANS[$data['listing_plan']],
            'payment_status' => 'pending',
            'status' => 'pending_review',
        ]);

        NotificationController::notifyAdmins(
            'New Property Draft Submitted 🏠',
            "A new listing '{$draft->property_type} in {$draft->district}' was submitted by " . ($draft->seller_name ?: 'a seller') . ' and is awaiting review.',
            'listing',
            '/admin'
        );

        if ($hasLegalDocs) {
            $lawyerIds = User::where('role', 'lawyer')->pluck('id');
            foreach ($lawyerIds as $lawyerId) {
                NotificationController::send(
                    $lawyerId,
                    'Property Documents to Verify ⚖️',
                    "New legal documents submitted for '{$draft->property_type} in {$draft->district}' by {$sellerName}. Please review for legal title clearance.",
                    'listing',
                    '/lawyer'
                );
            }
        }

        return response()->json([
            'message' => 'Your listing request was sent. Admin will review payment, and certified lawyers will inspect your uploaded deeds.',
            'data' => $draft,
        ], 201);
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $query = SellerPropertyDraft::withCount('inquiries')
            ->where('status', 'published')
            ->when($request->filled('type'), fn ($q) => $q->where('property_type', $request->type))
            ->when($request->filled('district'), fn ($q) => $q->where('district', $request->district))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(fn ($inner) => $inner
                    ->where('property_type', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('expected_price', 'like', "%{$search}%"));
            });

        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'oldest' => $query->orderBy('published_at'),
            'plan' => $query->orderByDesc('listing_fee')->orderByDesc('published_at'),
            default => $query->orderByDesc('published_at'),
        };

        $properties = $query->get()->map(fn ($property) => $this->publicResource($property));

        return response()->json([
            'data' => $properties,
            'total' => $properties->count(),
            'filters' => [
                'districts' => SellerPropertyDraft::where('status', 'published')->distinct()->orderBy('district')->pluck('district')->values(),
                'types' => SellerPropertyDraft::where('status', 'published')->distinct()->orderBy('property_type')->pluck('property_type')->values(),
            ],
        ]);
    }

    public function publicShow(int $id): JsonResponse
    {
        $property = SellerPropertyDraft::with(['seller:id,name,email,phone', 'inquiries'])
            ->where('status', 'published')
            ->findOrFail($id);

        return response()->json(['data' => $this->publicResource($property, true)]);
    }

    public function sellerListings(Request $request): JsonResponse
    {
        $sellerId = $request->integer('seller_id');
        $sellerEmail = $request->query('seller_email');

        $listings = SellerPropertyDraft::with(['deedVerifier:id,name'])->withCount('inquiries')
            ->when($sellerId, fn ($q) => $q->where('seller_id', $sellerId))
            ->when(! $sellerId && $sellerEmail, fn ($q) => $q->where('seller_email', $sellerEmail))
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($draft) {
                return [
                    ...$draft->toArray(),
                    'deed_document_url' => $draft->deed_document_path ? Storage::disk('public')->url($draft->deed_document_path) : null,
                    'survey_plan_url' => $draft->survey_plan_path ? Storage::disk('public')->url($draft->survey_plan_path) : null,
                    'council_document_url' => $draft->council_document_path ? Storage::disk('public')->url($draft->council_document_path) : null,
                    'other_document_url' => $draft->other_document_path ? Storage::disk('public')->url($draft->other_document_path) : null,
                    'verifier_name' => $draft->deedVerifier?->name,
                ];
            });

        return response()->json(['data' => $listings]);
    }

    public function publishedForAdmin(): JsonResponse
    {
        $listings = SellerPropertyDraft::with(['seller:id,name,email', 'reviewer:id,name'])
            ->withCount('inquiries')
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->get();

        return response()->json(['data' => $listings, 'total' => $listings->count()]);
    }

    public function pending(): JsonResponse
    {
        $drafts = SellerPropertyDraft::with('seller:id,name,email')
            ->where('status', 'pending_review')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $drafts, 'total' => $drafts->count()]);
    }

    public function approve(int $id): JsonResponse
    {
        $draft = SellerPropertyDraft::findOrFail($id);

        if ($draft->payment_status !== 'paid') {
            return response()->json([
                'message' => 'Mark the seller payment as paid before publishing this listing.',
            ], 422);
        }

        $draft->update([
            'status' => 'published',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        if ($draft->seller_id) {
            NotificationController::send(
                $draft->seller_id,
                'Listing Approved & Published! 🎉',
                "Your listing '{$draft->property_type} in {$draft->district}' has been approved and is now live on the marketplace.",
                'listing',
                "/property/{$draft->id}"
            );
        }

        return response()->json([
            'message' => 'Listing draft approved and published.',
            'data' => $draft->fresh(),
        ]);
    }

    public function markPaid(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'payment_reference' => 'nullable|string|max:120',
            'payment_note' => 'nullable|string|max:500',
        ]);

        $draft = SellerPropertyDraft::findOrFail($id);
        $draft->update([
            'payment_status' => 'paid',
            'payment_reference' => $data['payment_reference'] ?? $draft->payment_reference,
            'payment_note' => $data['payment_note'] ?? $draft->payment_note,
            'paid_at' => now(),
        ]);

        Payment::updateOrCreate(
            ['order_id' => $draft->payment_reference ?: 'ADMIN-LISTING-'.$draft->id],
            [
                'user_id' => $draft->seller_id,
                'seller_property_draft_id' => $draft->id,
                'provider' => $draft->payment_method ?: 'manual',
                'plan' => $draft->listing_plan,
                'amount' => $draft->listing_fee ?: self::LISTING_PLANS[$draft->listing_plan],
                'currency' => 'LKR',
                'status' => 'paid',
                'payer_name' => $draft->seller_name,
                'payer_email' => $draft->seller_email,
                'payer_phone' => $draft->contact_number,
                'payment_reference' => $draft->payment_reference,
                'gateway_payload' => ['source' => 'admin_mark_paid'],
                'paid_at' => $draft->paid_at,
            ]
        );

        return response()->json([
            'message' => 'Seller payment marked as paid.',
            'data' => $draft->fresh(),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $draft = SellerPropertyDraft::findOrFail($id);
        $draft->update([
            'status' => 'rejected',
            'rejection_reason' => $data['reason'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        if ($draft->seller_id) {
            NotificationController::send(
                $draft->seller_id,
                'Listing Requires Revision ⚠️',
                "Your listing '{$draft->property_type} in {$draft->district}' requires updates. Reason: {$data['reason']}",
                'listing',
                '/seller'
            );
        }

        return response()->json([
            'message' => 'Listing draft rejected.',
            'data' => $draft->fresh(),
        ]);
    }

    public function uploadDocuments(Request $request, int $id): JsonResponse
    {
        $draft = SellerPropertyDraft::findOrFail($id);

        $request->validate([
            'deed_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'survey_plan' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'council_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'other_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
        ]);

        $updates = [];
        $docsList = is_array($draft->documents) ? $draft->documents : [];

        if ($request->hasFile('deed_document')) {
            $updates['deed_document_path'] = $request->file('deed_document')->store('property-documents', 'public');
            if (! in_array('Title Deed / Extract Copy', $docsList)) {
                $docsList[] = 'Title Deed / Extract Copy';
            }
        }
        if ($request->hasFile('survey_plan')) {
            $updates['survey_plan_path'] = $request->file('survey_plan')->store('property-documents', 'public');
            if (! in_array('Registered Survey Plan', $docsList)) {
                $docsList[] = 'Registered Survey Plan';
            }
        }
        if ($request->hasFile('council_document')) {
            $updates['council_document_path'] = $request->file('council_document')->store('property-documents', 'public');
            if (! in_array('Local Council Non-Vesting / Street Line Clearance', $docsList)) {
                $docsList[] = 'Local Council Non-Vesting / Street Line Clearance';
            }
        }
        if ($request->hasFile('other_document')) {
            $updates['other_document_path'] = $request->file('other_document')->store('property-documents', 'public');
            if (! in_array('Supporting Legal Documentation', $docsList)) {
                $docsList[] = 'Supporting Legal Documentation';
            }
        }

        if (empty($updates)) {
            return response()->json(['message' => 'Please select at least one document to upload.'], 422);
        }

        $updates['documents'] = $docsList;
        $updates['legal_status'] = 'submitted_for_review';
        $updates['is_deed_verified'] = false; // requires lawyer verification

        $draft->update($updates);

        $lawyerIds = User::where('role', 'lawyer')->pluck('id');
        foreach ($lawyerIds as $lawyerId) {
            NotificationController::send(
                $lawyerId,
                'Property Documents Uploaded ⚖️',
                "Documents uploaded for '{$draft->property_type} in {$draft->district}' by {$draft->seller_name}. Ready for lawyer review.",
                'listing',
                '/lawyer'
            );
        }

        return response()->json([
            'message' => 'Legal documents uploaded successfully and submitted to panel lawyers for clearance.',
            'data' => $draft->fresh(),
        ]);
    }

    public function lawyerVerifications(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = SellerPropertyDraft::with(['seller', 'deedVerifier'])
            ->where(function ($q) {
                $q->whereNotNull('deed_document_path')
                    ->orWhereNotNull('survey_plan_path')
                    ->orWhereNotNull('council_document_path')
                    ->orWhereNotNull('other_document_path')
                    ->orWhere('legal_status', 'submitted_for_review');
            });

        if ($status === 'pending') {
            $query->where('legal_status', 'submitted_for_review');
        } elseif ($status === 'approved') {
            $query->where('legal_status', 'approved');
        } elseif ($status === 'rejected') {
            $query->where('legal_status', 'rejected');
        }

        $items = $query->latest()->get()->map(function (SellerPropertyDraft $item) {
            return [
                'id' => $item->id,
                'property_type' => $item->property_type,
                'title' => "{$item->property_type} in {$item->district}",
                'district' => $item->district,
                'expected_price' => $item->expected_price,
                'status' => $item->status,
                'legal_status' => $item->legal_status ?: 'submitted_for_review',
                'is_deed_verified' => (bool) $item->is_deed_verified,
                'deed_verified_at' => $item->deed_verified_at?->toDateTimeString(),
                'deed_verification_note' => $item->deed_verification_note,
                'legal_review_note' => $item->legal_review_note,
                'legal_reviewed_at' => $item->legal_reviewed_at?->toDateTimeString(),
                'deed_verifier' => $item->deedVerifier ? ['id' => $item->deedVerifier->id, 'name' => $item->deedVerifier->name] : null,
                'deed_document_url' => $item->deed_document_path ? Storage::disk('public')->url($item->deed_document_path) : null,
                'survey_plan_url' => $item->survey_plan_path ? Storage::disk('public')->url($item->survey_plan_path) : null,
                'council_document_url' => $item->council_document_path ? Storage::disk('public')->url($item->council_document_path) : null,
                'other_document_url' => $item->other_document_path ? Storage::disk('public')->url($item->other_document_path) : null,
                'image_url' => collect($item->property_images ?: [])->map(fn ($p) => Storage::disk('public')->url($p))->first(),
                'seller' => [
                    'id' => $item->seller?->id,
                    'name' => $item->seller?->name ?? $item->seller_name,
                    'email' => $item->seller?->email ?? $item->seller_email,
                    'phone' => $item->seller?->phone ?? $item->contact_number,
                ],
                'created_at' => $item->created_at?->toDateTimeString(),
            ];
        });

        return response()->json(['data' => $items]);
    }

    public function reviewLegalDocuments(Request $request, int $id): JsonResponse
    {
        $draft = SellerPropertyDraft::findOrFail($id);
        $action = $request->input('action');
        $note = $request->input('note', '');

        $lawyer = auth()->user();
        $lawyerName = $lawyer ? $lawyer->name : 'KNW Panel Attorney';

        if ($action === 'approve') {
            $draft->update([
                'is_deed_verified' => true,
                'legal_status' => 'approved',
                'deed_verified_at' => now(),
                'deed_verified_by' => $lawyer?->id,
                'legal_reviewed_at' => now(),
                'deed_verification_note' => $note ?: ('Verified and cleared by KNW Panel Attorney ' . $lawyerName),
                'legal_review_note' => $note ?: '30-year title deeds and registered survey plan cleared.',
            ]);

            if ($draft->seller_id) {
                NotificationController::send(
                    $draft->seller_id,
                    'Deed & Title Verified! 🛡️',
                    "Great news! Your property '{$draft->property_type} in {$draft->district}' has been legally cleared by Attorney {$lawyerName}. The KNW Certified Deed Verified badge is now active!",
                    'listing',
                    "/property/{$draft->id}"
                );
            }

            return response()->json([
                'message' => 'Property legal documents approved and marked as Deed Verified.',
                'data' => $draft->fresh(),
            ]);
        } else {
            $draft->update([
                'is_deed_verified' => false,
                'legal_status' => 'rejected',
                'legal_reviewed_at' => now(),
                'legal_review_note' => $note ?: 'Document clarification required.',
                'deed_verification_note' => null,
            ]);

            if ($draft->seller_id) {
                NotificationController::send(
                    $draft->seller_id,
                    'Document Clarification Required ⚠️',
                    "Attorney {$lawyerName} reviewed your property documents for '{$draft->property_type} in {$draft->district}'. Note: {$note}. Please upload revised documents.",
                    'listing',
                    '/seller-dashboard'
                );
            }

            return response()->json([
                'message' => 'Property documents flagged as rejected / requires revision.',
                'data' => $draft->fresh(),
            ]);
        }
    }

    public function toggleDeedVerified(Request $request, int $id): JsonResponse
    {
        $draft = SellerPropertyDraft::findOrFail($id);
        $isVerified = ! $draft->is_deed_verified;
        $draft->update([
            'is_deed_verified' => $isVerified,
            'legal_status' => $isVerified ? 'approved' : 'no_documents',
            'deed_verified_at' => $isVerified ? now() : null,
            'deed_verified_by' => $isVerified ? auth()->id() : null,
            'deed_verification_note' => $request->input('note', 'Verified by KNW Legal & Land Title Inspection team.'),
        ]);

        if ($isVerified && $draft->seller_id) {
            NotificationController::send(
                $draft->seller_id,
                'Deed Verified Badge Awarded! 🛡️',
                "Your listing '{$draft->property_type} in {$draft->district}' has received the KNW Certified Deed Verified inspection badge!",
                'listing',
                "/property/{$draft->id}"
            );
        }

        return response()->json([
            'message' => $isVerified ? 'Listing marked as Deed Verified (KNW Certified).' : 'Deed verification removed.',
            'data' => $draft->fresh(),
        ]);
    }

    private function publicResource(SellerPropertyDraft $property, bool $includeContact = false): array
    {
        $planLabels = [
            'basic' => 'For Sale',
            'verified' => 'Verified',
            'featured' => 'Featured',
        ];

        // STRICT VERIFICATION: Deed is verified ONLY if lawyer approved it! Never just by buying the verified plan.
        $isDeedVerified = (bool) ($property->is_deed_verified && $property->legal_status === 'approved');

        // Only return documents that were actually uploaded
        $clearedDocuments = [];
        if ($property->deed_document_path) {
            $clearedDocuments[] = [
                'name' => 'Title Deed / Extract Copy',
                'type' => 'deed',
                'url' => Storage::disk('public')->url($property->deed_document_path),
                'is_cleared' => $isDeedVerified,
            ];
        }
        if ($property->survey_plan_path) {
            $clearedDocuments[] = [
                'name' => 'Registered Survey Plan',
                'type' => 'survey_plan',
                'url' => Storage::disk('public')->url($property->survey_plan_path),
                'is_cleared' => $isDeedVerified,
            ];
        }
        if ($property->council_document_path) {
            $clearedDocuments[] = [
                'name' => 'Local Council Non-Vesting / Street Line Clearance',
                'type' => 'council',
                'url' => Storage::disk('public')->url($property->council_document_path),
                'is_cleared' => $isDeedVerified,
            ];
        }
        if ($property->other_document_path) {
            $clearedDocuments[] = [
                'name' => 'Supporting Legal Documentation',
                'type' => 'other',
                'url' => Storage::disk('public')->url($property->other_document_path),
                'is_cleared' => $isDeedVerified,
            ];
        }

        return [
            'id' => $property->id,
            'type' => $property->property_type,
            'title' => "{$property->property_type} in {$property->district}",
            'district' => $property->district,
            'price' => $property->expected_price,
            'description' => $property->description,
            'documents' => $clearedDocuments,
            'has_uploaded_documents' => ! empty($clearedDocuments),
            'legal_status' => $property->legal_status ?: ($isDeedVerified ? 'approved' : 'no_documents'),
            'legal_review_note' => $property->legal_review_note ?: $property->deed_verification_note,
            'deed_verifier_name' => $property->deedVerifier?->name,
            'property_images' => $property->property_images ?: [],
            'image_url' => collect($property->property_images ?: [])->map(fn ($path) => Storage::disk('public')->url($path))->first(),
            'image_urls' => collect($property->property_images ?: [])->map(fn ($path) => Storage::disk('public')->url($path))->values(),
            'location_url' => $property->location_url,
            'latitude' => $property->latitude,
            'longitude' => $property->longitude,
            'visit_dates' => $property->visit_dates ?: [],
            'visit_days' => $property->visit_days ?: [],
            'listing_plan' => $property->listing_plan,
            'badge_label' => $planLabels[$property->listing_plan] ?? 'For Sale',
            'is_deed_verified' => $isDeedVerified,
            'deed_verified_at' => $property->deed_verified_at?->toDateString(),
            'deed_verification_note' => $property->deed_verification_note,
            'deed_verified_badge' => $isDeedVerified ? 'KNW Certified Inspection' : null,
            'watermark_label' => 'VERIFIED PREVIEW - KNW PRO REALTOR',
            'whatsapp_phone' => preg_replace('/[^0-9]/', '', $property->contact_number ?: ($property->seller?->phone ?: '94771234567')),
            'published_at' => $property->published_at?->toDateTimeString(),
            'inquiries_count' => $property->inquiries_count ?? $property->inquiries?->count() ?? 0,
            'seller' => [
                'name' => $property->seller?->name ?? $property->seller_name ?? 'KNW PRO REALTOR seller',
                'email' => $includeContact ? ($property->seller?->email ?? $property->seller_email) : null,
                'phone' => $includeContact ? ($property->seller?->phone ?? $property->contact_number) : null,
            ],
            'contact_number' => $includeContact ? $property->contact_number : null,
            'preferred_visit_date' => $includeContact ? $property->preferred_visit_date?->toDateString() : null,
            'visit_time' => $includeContact ? $property->visit_time : null,
        ];
    }
}
