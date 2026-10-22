<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private const LISTING_PLANS = [
        'basic' => ['name' => 'Basic Listing', 'price' => 500],
        'verified' => ['name' => 'Verified Listing', 'price' => 1000],
        'featured' => ['name' => 'Featured Listing', 'price' => 2500],
    ];

    public function payHereCheckout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'listing_plan' => 'required|in:basic,verified,featured',
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'phone' => 'required|string|max:30',
            'district' => 'nullable|string|max:80',
            'user_id' => 'nullable|exists:users,id',
            'seller_property_draft_id' => 'nullable|exists:seller_property_drafts,id',
        ]);

        $plan = self::LISTING_PLANS[$data['listing_plan']];
        $amount = number_format($plan['price'], 2, '.', '');
        $currency = config('services.payhere.currency', 'LKR');
        $orderId = 'KNW-LISTING-'.now()->format('YmdHis').'-'.random_int(1000, 9999);

        $merchantId = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');

        if (! $merchantId || ! $merchantSecret) {
            if (config('services.payhere.allow_demo_checkout')) {
                Payment::create([
                    'user_id' => $data['user_id'] ?? null,
                    'seller_property_draft_id' => $data['seller_property_draft_id'] ?? null,
                    'provider' => 'payhere_demo',
                    'order_id' => $orderId,
                    'plan' => $data['listing_plan'],
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => 'demo_paid',
                    'payer_name' => $data['name'],
                    'payer_email' => $data['email'],
                    'payer_phone' => $data['phone'],
                    'payment_reference' => $orderId,
                    'gateway_payload' => ['district' => $data['district'] ?? null, 'mode' => 'demo'],
                    'paid_at' => now(),
                ]);

                return response()->json([
                    'demo' => true,
                    'message' => 'Demo payment successful. Add real PayHere merchant keys before collecting real card payments.',
                    'order_id' => $orderId,
                    'amount' => $amount,
                    'currency' => $currency,
                    'plan' => $plan['name'],
                ]);
            }

            return response()->json([
                'message' => 'PayHere is not configured yet. Add PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET to the backend .env file.',
            ], 422);
        }

        $nameParts = preg_split('/\s+/', trim($data['name']), 2);
        $firstName = $nameParts[0] ?: 'Customer';
        $lastName = $nameParts[1] ?? '-';
        $hashedSecret = strtoupper(md5($merchantSecret));
        $hash = strtoupper(md5($merchantId.$orderId.$amount.$currency.$hashedSecret));

        Payment::create([
            'user_id' => $data['user_id'] ?? null,
            'seller_property_draft_id' => $data['seller_property_draft_id'] ?? null,
            'provider' => 'payhere',
            'order_id' => $orderId,
            'plan' => $data['listing_plan'],
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
            'payer_name' => $data['name'],
            'payer_email' => $data['email'],
            'payer_phone' => $data['phone'],
            'gateway_payload' => ['district' => $data['district'] ?? null],
        ]);

        return response()->json([
            'action_url' => config('services.payhere.sandbox', true)
                ? 'https://sandbox.payhere.lk/pay/checkout'
                : 'https://www.payhere.lk/pay/checkout',
            'fields' => [
                'merchant_id' => $merchantId,
                'return_url' => config('services.payhere.return_url'),
                'cancel_url' => config('services.payhere.cancel_url'),
                'notify_url' => config('services.payhere.notify_url'),
                'order_id' => $orderId,
                'items' => 'KNW PRO REALTOR '.$plan['name'],
                'currency' => $currency,
                'amount' => $amount,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['district'] ?: 'Sri Lanka',
                'city' => $data['district'] ?: 'Colombo',
                'country' => 'Sri Lanka',
                'custom_1' => $data['listing_plan'],
                'custom_2' => 'seller_listing',
                'hash' => $hash,
            ],
        ]);
    }
}
