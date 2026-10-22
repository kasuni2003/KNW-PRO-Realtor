<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function published(): JsonResponse
    {
        $posts = BlogPost::with('author:id,name,role')
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->get();

        return response()->json(['data' => $posts]);
    }

    public function lawyerPosts(Request $request): JsonResponse
    {
        $posts = BlogPost::with('author:id,name,role')
            ->when($request->filled('author_id'), fn ($query) => $query->where('author_id', $request->author_id))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedPost($request);
        $status = $request->input('status', 'draft');

        $post = BlogPost::create([
            ...$data,
            'slug' => $this->uniqueSlug($data['title']),
            'status' => in_array($status, ['draft', 'pending_review', 'published']) ? $status : 'draft',
            'submitted_at' => $status === 'pending_review' ? now() : null,
            'published_at' => $status === 'published' ? now() : null,
            'approved_at' => $status === 'published' ? now() : null,
            'approved_by' => $status === 'published' ? $request->input('approved_by') : null,
        ]);

        return response()->json([
            'message' => $post->status === 'pending_review' ? 'Blog post sent for admin review.' : 'Blog post saved.',
            'data' => $post->load('author:id,name,role'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $data = $this->validatedPost($request, false);

        if (isset($data['title']) && $data['title'] !== $post->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        $post->update($data);

        return response()->json([
            'message' => 'Blog post updated.',
            'data' => $post->fresh()->load('author:id,name,role'),
        ]);
    }

    public function submit(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json(['message' => 'Blog post submitted for admin review.', 'data' => $post->fresh()]);
    }

    public function adminIndex(): JsonResponse
    {
        $posts = BlogPost::with('author:id,name,role')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $posts]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'published',
            'approved_at' => now(),
            'approved_by' => $request->input('approved_by'),
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json(['message' => 'Blog post approved and published.', 'data' => $post->fresh()]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => 'required|string|max:500']);
        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'rejected',
            'rejection_reason' => $data['reason'],
        ]);

        return response()->json(['message' => 'Blog post rejected.', 'data' => $post->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Blog post deleted.']);
    }

    private function validatedPost(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'author_id' => [$creating ? 'required' : 'sometimes', 'nullable', 'exists:users,id'],
            'title' => [$creating ? 'required' : 'sometimes', 'string', 'max:180'],
            'excerpt' => 'nullable|string|max:700',
            'content' => [$creating ? 'required' : 'sometimes', 'string'],
            'category' => 'nullable|string|max:80',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'cover_image' => 'nullable|string|max:255',
        ]);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'post';
        $slug = $base;
        $count = 2;

        while (BlogPost::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }
}
