<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id') ?: auth()->id();

        if (! $userId) {
            return response()->json([
                'data' => [],
                'unread_count' => 0,
            ]);
        }

        $notifications = Notification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $unreadCount = Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $userId = $request->integer('user_id') ?: auth()->id();

        $notification = Notification::where('id', $id)
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'data' => $notification->fresh(),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id') ?: auth()->id();

        if (! $userId) {
            return response()->json(['message' => 'User ID required.'], 422);
        }

        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->integer('user_id') ?: auth()->id();

        Notification::where('id', $id)
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->delete();

        return response()->json([
            'message' => 'Notification removed.',
        ]);
    }

    public static function send(
        int $userId,
        string $title,
        string $message,
        string $type = 'general',
        ?string $actionUrl = null
    ): ?Notification {
        try {
            return Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'action_url' => $actionUrl,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Could not create notification: ' . $e->getMessage());
            return null;
        }
    }

    public static function notifyAdmins(
        string $title,
        string $message,
        string $type = 'general',
        ?string $actionUrl = null
    ): void {
        try {
            $adminIds = User::whereIn('role', ['admin', 'staff'])->pluck('id');
            foreach ($adminIds as $adminId) {
                self::send($adminId, $title, $message, $type, $actionUrl);
            }
        } catch (\Throwable $e) {
            \Log::error('Could not notify admins: ' . $e->getMessage());
        }
    }
}
