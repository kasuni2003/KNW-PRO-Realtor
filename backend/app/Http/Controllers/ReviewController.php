<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function publicIndex(Request $request): JsonResponse
    {
        $reviews = Review::with('property:id,property_type,district,expected_price')
            ->where('status', 'approved')
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->when($request->filled('rating'), fn ($q) => $q->where('rating', $request->integer('rating')))
            ->orderByDesc('approved_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $reviews,
            'total' => $reviews->count(),
            'summary' => $this->summary($reviews),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'seller_property_draft_id' => 'nullable|exists:seller_property_drafts,id',
            'name' => 'required|string|max:120',
            'email' => 'nullable|email|max:160',
            'role_label' => 'nullable|string|max:120',
            'country' => 'nullable|string|max:80',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:160',
            'comment' => 'required|string|max:2000',
            'type' => 'required|in:buyer,seller,foreign_buyer,lawyer_client',
        ]);

        $review = Review::create([
            ...$data,
            'status' => 'approved',
            'verified' => true,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you! Your review has been submitted and published.',
            'data' => $review,
        ], 201);
    }

    public function adminIndex(): JsonResponse
    {
        $reviews = Review::with(['property:id,property_type,district,expected_price', 'user:id,name,email'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reviews, 'total' => $reviews->count()]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update([
            'status' => 'approved',
            'verified' => true,
            'approved_at' => now(),
            'approved_by' => $request->input('approved_by'),
            'admin_note' => null,
        ]);

        return response()->json(['message' => 'Review approved and published.', 'data' => $review->fresh()]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'status' => 'rejected',
            'admin_note' => $data['admin_note'],
        ]);

        return response()->json(['message' => 'Review rejected.', 'data' => $review->fresh()]);
    }

    public function userReviews(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id');
        $email = $request->query('email');

        $reviews = Review::with('property:id,property_type,district,expected_price')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->when(! $userId && $email, fn ($q) => $q->where('email', $email))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $reviews, 'total' => $reviews->count()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review deleted.']);
    }

    public function destroyUserReview(Request $request, int $id): JsonResponse
    {
        $userId = $request->input('user_id');
        $review = Review::where('id', $id)
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }

    private function summary($reviews): array
    {
        $total = $reviews->count();
        $average = $total ? round($reviews->avg('rating'), 1) : 0;

        return [
            'average' => $average,
            'count' => $total,
            'five_star_percent' => $total ? round($reviews->where('rating', 5)->count() / $total * 100) : 0,
        ];
    }
}
