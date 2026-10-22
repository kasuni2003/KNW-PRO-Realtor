<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentRecordController extends Controller
{
    public function adminIndex(): JsonResponse
    {
        $payments = Payment::with(['user:id,name,email', 'property:id,property_type,district,expected_price', 'appointment:id,lawyer_id,appointment_date,start_time,topic,consultation_type,fee_amount,platform_commission,lawyer_earnings', 'appointment.lawyer:id,name,email'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $payments,
            'total' => $payments->count(),
            'revenue' => [
                'paid' => $payments->whereIn('status', ['paid', 'demo_paid'])->sum('amount'),
                'pending' => $payments->where('status', 'pending')->sum('amount'),
            ],
        ]);
    }

    public function sellerIndex(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'email' => 'nullable|email',
        ]);

        $payments = Payment::with('property:id,property_type,district,expected_price')
            ->when($data['user_id'] ?? null, fn ($q, $userId) => $q->where('user_id', $userId))
            ->when(! ($data['user_id'] ?? null) && ($data['email'] ?? null), fn ($q) => $q->where('payer_email', $data['email']))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $payments, 'total' => $payments->count()]);
    }
}
