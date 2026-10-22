<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\NotificationController;
use App\Models\Appointment;
use App\Models\BlogPost;
use App\Models\Payment;
use App\Models\Review;
use App\Models\SellerPropertyDraft;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class AdminUserController extends Controller
{
    public function summary(): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),
            'buyers' => User::where('role', 'buyer')->count(),
            'sellers' => User::where('role', 'seller')->count(),
            'pending_sellers' => User::where(fn ($q) => $q->where('role', 'seller')->where('status', 'pending')->orWhere('seller_status', 'pending'))->count(),
            'pending_listings' => SellerPropertyDraft::where('status', 'pending_review')->count(),
            'pending_blog_posts' => BlogPost::where('status', 'pending_review')->count(),
            'pending_reviews' => Review::where('status', 'pending')->count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'payments_total' => Payment::whereIn('status', ['paid', 'demo_paid'])->sum('amount'),
            'payments_pending' => Payment::where('status', 'pending')->sum('amount'),
            'staff' => User::where('role', 'staff')->count(),
            'lawyers' => User::where('role', 'lawyer')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'new_today' => User::whereDate('created_at', today())->count(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::query()->orderBy('created_at', 'desc');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:staff,lawyer',
            'phone' => 'nullable|string|max:20',
        ]);

        $tempPassword = Str::random(10) . '!1Aa';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($tempPassword),
            'role' => $request->role,
            'status' => 'active',
            'phone' => $request->phone,
        ]);

        $mailSent = $this->sendInviteEmail($user, $tempPassword);

        return response()->json([
            'message' => $mailSent
                ? "{$request->role} account created successfully. Temporary password email queued."
                : "{$request->role} account created successfully, but the invite email could not be sent. Use the temporary password shown here.",
            'user' => $user,
            'temp_password' => $tempPassword,
            'mail_sent' => $mailSent,
        ], 201);
    }

    public function approveSeller(Request $request, int $id): JsonResponse
    {
        $seller = User::findOrFail($id);

        if ($seller->canListProperty()) {
            return response()->json(['message' => 'This seller is already approved.'], 422);
        }

        $seller->update([
            'status'           => $seller->role === 'seller' ? 'active' : $seller->status,
            'seller_status'    => 'active',
            'approved_at'      => now(),
            'approved_by'      => auth()->id(),
            'rejection_reason' => null,
        ]);

        NotificationController::send(
            $seller->id,
            'Seller Account Approved! 🏠',
            'Congratulations! Your seller account is active. You can now post properties on KNW PRO Realtor.',
            'account',
            '/seller'
        );

        return response()->json([
            'message' => "Seller {$seller->name} has been approved.",
            'user' => $seller->fresh(),
        ]);
    }

    public function rejectSeller(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $seller = User::findOrFail($id);

        $seller->update([
            'status'           => $seller->role === 'seller' ? 'rejected' : $seller->status,
            'seller_status'    => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        NotificationController::send(
            $seller->id,
            'Seller Account Application Update',
            "Your seller account registration was not approved. Reason: {$request->reason}",
            'account',
            '/seller'
        );

        return response()->json([
            'message' => "Seller {$seller->name} has been rejected.",
        ]);
    }

    public function suspend(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot suspend an admin account.'], 422);
        }

        $newStatus = $user->isSuspended() ? 'active' : 'suspended';
        $user->update(['status' => $newStatus]);

        return response()->json([
            'message' => $newStatus === 'suspended'
                ? "User {$user->name} has been suspended."
                : "User {$user->name} has been reactivated.",
            'status' => $newStatus,
        ]);
    }

    public function updateRole(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|in:admin,staff,lawyer,seller,buyer',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => "Role updated to {$request->role}.",
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete an admin account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function pendingSellers(): JsonResponse
    {
        $sellers = User::where(function ($q) {
                $q->where('role', 'seller')->where('status', 'pending')
                  ->orWhere('seller_status', 'pending');
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['data' => $sellers, 'total' => $sellers->count()]);
    }

    public function viewSellerDocument(int $id)
    {
        $seller = User::findOrFail($id);

        if (! $seller->nic_document_path || ! Storage::disk('private')->exists($seller->nic_document_path)) {
            return response()->json(['message' => 'Identity verification document not found or not uploaded.'], 404);
        }

        return Storage::disk('private')->response($seller->nic_document_path);
    }

    private function sendInviteEmail(User $user, string $tempPassword): bool
    {
        try {
            Mail::raw(
                "Hello {$user->name},\n\n".
                "Your KNW PRO REALTOR {$user->role} account has been created.\n\n".
                "Login email: {$user->email}\n".
                "Temporary password: {$tempPassword}\n\n".
                                                                 "Please sign in with this temporary password and change it from your dashboard.\n\n".
                "Thank you,\nKNW PRO REALTOR",
                function ($message) use ($user) {
                    $message
                        ->to($user->email)
                        ->subject('Your KNW PRO REALTOR account login details');
                }
            );

            return true;
        } catch (Throwable $error) {
            Log::warning('Could not send staff/lawyer invite email.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $error->getMessage(),
            ]);

            return false;
        }
    }
}
