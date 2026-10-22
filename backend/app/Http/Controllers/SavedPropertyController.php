<?php

namespace App\Http\Controllers;

use App\Models\SavedProperty;
use App\Models\SellerPropertyDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SavedPropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $saved = SavedProperty::with('property')
            ->where('user_id', $data['user_id'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'note' => $item->note,
                'saved_at' => $item->created_at?->toDateTimeString(),
                'property' => $item->property ? $this->propertyResource($item->property) : null,
            ]);

        return response()->json(['data' => $saved, 'total' => $saved->count()]);
    }

    public function store(Request $request, int $propertyId): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'note' => 'nullable|string|max:500',
        ]);

        SellerPropertyDraft::where('status', 'published')->findOrFail($propertyId);

        $saved = SavedProperty::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'seller_property_draft_id' => $propertyId,
            ],
            ['note' => $data['note'] ?? null]
        );

        return response()->json([
            'message' => 'Property saved to your shortlist.',
            'data' => $saved,
        ], 201);
    }

    public function destroy(Request $request, int $propertyId): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        SavedProperty::where('user_id', $data['user_id'])
            ->where('seller_property_draft_id', $propertyId)
            ->delete();

        return response()->json(['message' => 'Property removed from your saved list.']);
    }

    public function status(Request $request, int $propertyId): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $saved = SavedProperty::where('user_id', $data['user_id'])
            ->where('seller_property_draft_id', $propertyId)
            ->first();

        return response()->json(['saved' => (bool) $saved, 'data' => $saved]);
    }

    private function propertyResource(SellerPropertyDraft $property): array
    {
        return [
            'id' => $property->id,
            'type' => $property->property_type,
            'title' => "{$property->property_type} in {$property->district}",
            'district' => $property->district,
            'price' => $property->expected_price,
            'description' => $property->description,
            'listing_plan' => $property->listing_plan,
            'image_url' => collect($property->property_images ?: [])->map(fn ($path) => Storage::disk('public')->url($path))->first(),
        ];
    }
}
