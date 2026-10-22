<?php
// app/Http/Middleware/RoleMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Usage in routes:
     *   ->middleware('role:admin')
     *   ->middleware('role:admin,staff')
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        if (! auth()->check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = auth()->user();

        // Check role
        if (! in_array($user->role, $roles)) {
            return response()->json(['message' => 'Forbidden. You do not have permission.'], 403);
        }

        // Check account is active (except admin — always active)
        if (! $user->isAdmin() && ! $user->isActive()) {
            return response()->json([
                'message' => 'Your account is not active.',
                'status'  => $user->status,
            ], 403);
        }

        return $next($request);
    }
}