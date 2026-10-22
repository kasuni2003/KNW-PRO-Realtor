<?php
// app/Http/Controllers/Auth/AuthController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER
    // Public endpoint — buyers and sellers self-register.
    // Staff / Lawyer / Admin are created ONLY by admin (see AdminUserController).
    // ─────────────────────────────────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email',
            'password'     => ['required', 'confirmed', Password::min(8)],
            'role'         => 'required|in:buyer,seller',  // only buyer/seller public
            'phone'        => 'nullable|string|max:20',
            // Seller-only fields
            'nic_number'   => 'nullable|string|max:20',
            'address'      => 'nullable|string|max:255',
            'nic_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Buyers go straight to active; sellers start as pending
        $status = $request->role === 'buyer' ? 'active' : 'pending';

        $nicPath = null;
        if ($request->hasFile('nic_document')) {
            $nicPath = $request->file('nic_document')
                               ->store('nic_documents', 'private');
        }

        $user = User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'password'          => $request->password, // auto-hashed via cast
            'role'              => $request->role,
            'status'            => $status,
            'seller_status'     => $request->role === 'seller' ? 'pending' : 'none',
            'phone'             => $request->phone,
            'nic_number'        => $request->nic_number,
            'nic_document_path' => $nicPath,
            'address'           => $request->address,
        ]);

        return response()->json([
            'message' => $status === 'active'
                ? 'Registration successful! Welcome to LankaRealty.'
                : 'Registration submitted. Our team will review your account within 1–2 business days.',
            'user'    => $this->userResource($user),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN — works for ALL roles
    // ─────────────────────────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The email or password is incorrect.'],
            ]);
        }

        // Block suspended accounts
        if ($user->isSuspended()) {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact support@lankarealty.lk.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $this->userResource($user),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET CURRENT USER  (GET /api/auth/me)
    // Called on app load to restore session from stored token
    // ─────────────────────────────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userResource($request->user()),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'user_id'          => 'nullable|exists:users,id',
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)
                                    ->letters()->mixedCase()->numbers()],
        ]);

        $user = $request->user() ?: User::findOrFail($request->user_id);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Password changed. Please log in again.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPLY FOR SELLER
    // Existing buyers/lawyers can submit seller identity verification
    // ─────────────────────────────────────────────────────────────────────────
    public function applyForSeller(Request $request): JsonResponse
    {
        $request->validate([
            'user_id'      => 'required|exists:users,id',
            'phone'        => 'required|string|max:30',
            'nic_number'   => 'required|string|max:30',
            'address'      => 'required|string|max:255',
            'nic_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->canListProperty()) {
            return response()->json([
                'message' => 'Your seller privileges are already approved and active.',
                'user'    => $this->userResource($user),
            ]);
        }

        $nicPath = $user->nic_document_path;
        if ($request->hasFile('nic_document')) {
            $nicPath = $request->file('nic_document')
                               ->store('nic_documents', 'private');
        }

        $user->update([
            'phone'             => $request->phone,
            'nic_number'        => $request->nic_number,
            'address'           => $request->address,
            'nic_document_path' => $nicPath,
            'seller_status'     => 'pending',
            'rejection_reason'  => null,
        ]);

        \App\Http\Controllers\NotificationController::notifyAdmins(
            'New Seller Verification Request 📄',
            "User {$user->name} ({$user->email}) submitted identity details to activate seller privileges.",
            'seller_request',
            '/admin'
        );

        return response()->json([
            'message' => 'Seller verification submitted! KNW Admin will review your identity document shortly.',
            'user'    => $this->userResource($user->fresh()),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper — user data returned to frontend
    // ─────────────────────────────────────────────────────────────────────────
    private function userResource(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role,
            'status'            => $user->status,
            'seller_status'     => $user->seller_status ?: ($user->role === 'seller' ? $user->status : 'none'),
            'phone'             => $user->phone,
            'address'           => $user->address,
            'nic_number'        => $user->nic_number,
            'rejection_reason'  => $user->rejection_reason,
            'approved_at'       => $user->approved_at?->toDateTimeString(),
            'created_at'        => $user->created_at->toDateTimeString(),
            // Computed permission flags for the frontend
            'can' => [
                'list_property' => $user->canListProperty(),
                'manage_users'  => $user->canManage(),
                'manage_legal'  => in_array($user->role, ['admin', 'lawyer']),
                'admin_only'        => $user->isAdmin(),
                'act_as_buyer'      => true,
                'act_as_seller'     => $user->canListProperty(),
                'is_pending_seller' => $user->isPendingSeller(),
                'is_lawyer'         => $user->isLawyer(),
            ],
        ];
    }
}
