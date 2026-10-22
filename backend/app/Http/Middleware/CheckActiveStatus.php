<?php
// app/Http/Middleware/CheckActiveStatus.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckActiveStatus
{
    /**
     * Block suspended users from all authenticated routes.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (auth()->check() && auth()->user()->isSuspended()) {
            // Revoke all tokens
            auth()->user()->tokens()->delete();

            return response()->json([
                'message' => 'Your account has been suspended. Please contact support.',
                'status'  => 'suspended',
            ], 403);
        }

        return $next($request);
    }
}