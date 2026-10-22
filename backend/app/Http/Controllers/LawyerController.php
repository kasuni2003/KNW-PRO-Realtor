<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\LawyerUnavailableDate;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawyerController extends Controller
{
    public function publicLawyers(): JsonResponse
    {
        $lawyers = User::query()
            ->where('role', 'lawyer')
            ->where('status', 'active')
            ->whereHas('lawyerProfile', fn ($q) => $q->where('is_available', true))
            ->with(['lawyerProfile', 'lawyerAvailability' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $lawyers]);
    }

    public function availableSlots(Request $request, int $lawyerId): JsonResponse
    {
        $data = $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        return response()->json([
            'data' => $this->slotsForDate($lawyerId, $data['date']),
        ]);
    }

    public function upsertProfile(Request $request, int $lawyerId): JsonResponse
    {
        $data = $request->validate([
            'specialization' => 'nullable|string|max:150',
            'bio' => 'nullable|string|max:2000',
            'office_location' => 'nullable|string|max:180',
            'consultation_fee' => 'nullable|numeric|min:0',
            'languages' => 'nullable|array',
            'languages.*' => 'string|max:40',
            'is_available' => 'boolean',
        ]);

        $profile = LawyerProfile::updateOrCreate(
            ['user_id' => $lawyerId],
            $data
        );

        return response()->json(['message' => 'Lawyer profile saved.', 'data' => $profile]);
    }

    public function dashboard(int $lawyerId): JsonResponse
    {
        $lawyer = User::with(['lawyerProfile', 'lawyerAvailability', 'lawyerUnavailableDates'])
            ->where('role', 'lawyer')
            ->findOrFail($lawyerId);

        $appointments = Appointment::where('lawyer_id', $lawyerId)
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'lawyer' => $lawyer,
            'appointments' => $appointments,
        ]);
    }

    public function storeAvailability(Request $request, int $lawyerId): JsonResponse
    {
        $data = $this->validateAvailability($request);

        $availability = LawyerAvailability::create([
            ...$data,
            'lawyer_id' => $lawyerId,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Availability added.', 'data' => $availability], 201);
    }

    public function updateAvailability(Request $request, int $id): JsonResponse
    {
        $data = $this->validateAvailability($request);
        $availability = LawyerAvailability::findOrFail($id);
        $availability->update($data);

        return response()->json(['message' => 'Availability updated.', 'data' => $availability->fresh()]);
    }

    public function deleteAvailability(int $id): JsonResponse
    {
        LawyerAvailability::findOrFail($id)->delete();
        return response()->json(['message' => 'Availability removed.']);
    }

    public function blockDate(Request $request, int $lawyerId): JsonResponse
    {
        $data = $request->validate([
            'date' => 'required|date',
            'reason' => 'nullable|string|max:180',
        ]);

        $blocked = LawyerUnavailableDate::updateOrCreate(
            ['lawyer_id' => $lawyerId, 'date' => $data['date']],
            ['reason' => $data['reason'] ?? null]
        );

        return response()->json(['message' => 'Unavailable date saved.', 'data' => $blocked]);
    }

    public function bookAppointment(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lawyer_id' => 'required|exists:users,id',
            'user_id' => 'nullable|exists:users,id',
            'customer_name' => 'required|string|max:120',
            'customer_email' => 'required|email|max:160',
            'customer_phone' => 'nullable|string|max:30',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'topic' => 'required|string|max:160',
            'message' => 'nullable|string|max:1500',
            'consultation_type' => 'nullable|in:video,office',
            'user_role' => 'nullable|string|max:50',
            'payment_method' => 'required|in:online,payhere,bank_transfer',
            'payment_reference' => 'nullable|string|max:100',
            'bank_slip' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $slot = $this->findAvailableSlot($data['lawyer_id'], $data['appointment_date'], $data['start_time']);

        if (! $slot) {
            return response()->json(['message' => 'This appointment slot is not available.'], 422);
        }

        $lawyer = User::with('lawyerProfile')->findOrFail($data['lawyer_id']);
        $fee = (float) ($lawyer->lawyerProfile?->consultation_fee ?: 5000.00);
        $platformCommission = round($fee * 0.25, 2); // 25% Platform cut
        $lawyerEarnings = round($fee - $platformCommission, 2); // 75% Lawyer payout
        $consultationType = $data['consultation_type'] ?? 'video';
        $officeLocation = $consultationType === 'office'
            ? ($lawyer->lawyerProfile?->office_location ?: 'Attorney Chambers, Colombo 03')
            : null;

        $slipUrl = null;
        if ($request->hasFile('bank_slip')) {
            $slipUrl = '/storage/' . $request->file('bank_slip')->store('consultation-slips', 'public');
        }

        $isBankTransfer = $data['payment_method'] === 'bank_transfer';
        $paymentStatus = $isBankTransfer ? 'pending_verification' : 'paid';
        $initialAppointmentStatus = $isBankTransfer ? 'pending' : 'confirmed';

        $appointment = Appointment::create([
            'lawyer_id' => $data['lawyer_id'],
            'user_id' => $data['user_id'] ?? null,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'] ?? null,
            'appointment_date' => $data['appointment_date'],
            'start_time' => $slot['start_time'],
            'end_time' => $slot['end_time'],
            'topic' => $data['topic'],
            'consultation_type' => $consultationType,
            'office_location' => $officeLocation,
            'fee_amount' => $fee,
            'platform_commission' => $platformCommission,
            'lawyer_earnings' => $lawyerEarnings,
            'payment_method' => $data['payment_method'],
            'payment_status' => $paymentStatus,
            'bank_slip_url' => $slipUrl,
            'user_role' => $data['user_role'] ?? 'buyer',
            'message' => $data['message'] ?? null,
            'status' => $initialAppointmentStatus,
        ]);

        if (! $isBankTransfer && $consultationType === 'video') {
            $roomCode = 'KNW-Legal-Room-' . $appointment->id . '-' . substr(md5($appointment->id . config('app.key', 'knw-realtor')), 0, 8);
            $appointment->update(['video_meeting_url' => 'https://meet.jit.si/' . $roomCode]);
        }

        $orderId = 'KNW-LEGAL-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
        Payment::create([
            'user_id' => $data['user_id'] ?? null,
            'appointment_id' => $appointment->id,
            'provider' => $isBankTransfer ? 'bank_transfer' : 'payhere_online',
            'order_id' => $orderId,
            'plan' => 'legal_consultation',
            'amount' => $fee,
            'currency' => 'LKR',
            'status' => $isBankTransfer ? 'pending' : 'paid',
            'payer_name' => $data['customer_name'],
            'payer_email' => $data['customer_email'],
            'payer_phone' => $data['customer_phone'] ?? null,
            'payment_reference' => $data['payment_reference'] ?? $orderId,
            'gateway_payload' => [
                'consultation_type' => $consultationType,
                'platform_commission' => $platformCommission,
                'lawyer_earnings' => $lawyerEarnings,
                'bank_slip_url' => $slipUrl,
            ],
            'paid_at' => $isBankTransfer ? null : now(),
        ]);

        NotificationController::send(
            $data['lawyer_id'],
            'New Legal Consultation (' . ($consultationType === 'office' ? 'Office Visit' : 'Video') . ') ⚖️',
            "{$data['customer_name']} booked an appointment on {$data['appointment_date']} at {$slot['start_time']} (Fee: Rs. " . number_format($fee) . "). Payment: {$paymentStatus}.",
            'appointment',
            '/lawyer'
        );

        if (! empty($data['user_id'])) {
            $confirmText = $isBankTransfer
                ? "Your consultation request with bank transfer slip (Rs. " . number_format($fee) . ") has been received. Our admin team will verify the payment."
                : "Your consultation appointment is confirmed! (Fee: Rs. " . number_format($fee) . " paid). " . ($consultationType === 'office' ? "Office: {$officeLocation}" : "Video meeting room ready.");

            NotificationController::send(
                $data['user_id'],
                'Legal Consultation Booked ⚖️',
                $confirmText,
                'appointment',
                '/legal'
            );
        }

        return response()->json([
            'message' => $isBankTransfer
                ? 'Appointment booked! Your bank transfer slip was uploaded for verification.'
                : 'Appointment confirmed and payment processed successfully!',
            'data' => $appointment->fresh(['lawyer', 'payment']),
        ], 201);
    }

    public function updateAppointment(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,rescheduled,completed,cancelled,rejected',
            'appointment_date' => 'nullable|required_with:start_time|date|after_or_equal:today',
            'start_time' => 'nullable|required_with:appointment_date|date_format:H:i',
            'lawyer_note' => 'nullable|string|max:1000',
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::findOrFail($id);

        if (! empty($data['appointment_date']) && ! empty($data['start_time'])) {
            $slot = $this->findAvailableSlot(
                $appointment->lawyer_id,
                $data['appointment_date'],
                $data['start_time'],
                $appointment->id
            );

            if (! $slot) {
                return response()->json(['message' => 'This appointment slot is not available.'], 422);
            }

            $data['start_time'] = $slot['start_time'];
            $data['end_time'] = $slot['end_time'];
            $data['status'] = $data['status'] === 'confirmed' ? 'confirmed' : 'rescheduled';
        }

        if ($data['status'] === 'confirmed' && empty($appointment->video_meeting_url)) {
            $roomCode = 'KNW-Legal-Room-' . $appointment->id . '-' . substr(md5($appointment->id . config('app.key', 'knw-realtor')), 0, 8);
            $data['video_meeting_url'] = 'https://meet.jit.si/' . $roomCode;
        }

        $appointment->update($data);

        if ($appointment->user_id) {
            if ($data['status'] === 'confirmed') {
                NotificationController::send(
                    $appointment->user_id,
                    'Video Consultation Confirmed! 📹',
                    "Attorney confirmed your appointment for {$appointment->appointment_date->toDateString()} at {$appointment->start_time}. Your secure video room is ready!",
                    'appointment',
                    '/legal'
                );
            } elseif ($data['status'] === 'rescheduled') {
                NotificationController::send(
                    $appointment->user_id,
                    'Appointment Rescheduled 📅',
                    "Attorney proposed a new appointment time: {$appointment->appointment_date->toDateString()} at {$appointment->start_time}.",
                    'appointment',
                    '/legal'
                );
            }
        }

        return response()->json(['message' => 'Appointment updated.', 'data' => $appointment->fresh()]);
    }

    public function userAppointments(Request $request): JsonResponse
    {
        $userId = $request->integer('user_id');
        $email = $request->query('email');

        $appointments = Appointment::with(['lawyer:id,name,email', 'lawyer.lawyerProfile', 'payment'])
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->when(! $userId && $email, fn ($q) => $q->where('customer_email', $email))
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->get();

        return response()->json(['data' => $appointments]);
    }

    public function adminAppointments(): JsonResponse
    {
        $appointments = Appointment::with(['lawyer:id,name,email', 'lawyer.lawyerProfile', 'customer:id,name,email', 'payment'])
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->get();

        return response()->json(['data' => $appointments]);
    }

    public function approveConsultationPayment(int $id): JsonResponse
    {
        $appointment = Appointment::with(['lawyer:id,name,email', 'customer:id,name,email'])->findOrFail($id);

        $updateData = [
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ];

        if ($appointment->consultation_type === 'video' && empty($appointment->video_meeting_url)) {
            $roomCode = 'KNW-Legal-Room-' . $appointment->id . '-' . substr(md5($appointment->id . config('app.key', 'knw-realtor')), 0, 8);
            $updateData['video_meeting_url'] = 'https://meet.jit.si/' . $roomCode;
        }

        $appointment->update($updateData);

        Payment::where('appointment_id', $appointment->id)->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($appointment->user_id) {
            NotificationController::send(
                $appointment->user_id,
                'Legal Consultation Payment Verified! ⚖️',
                "Your consultation fee payment has been approved. Your appointment for {$appointment->appointment_date->toDateString()} is confirmed!",
                'appointment',
                '/legal'
            );
        }

        NotificationController::send(
            $appointment->lawyer_id,
            'Consultation Confirmed (Payment Cleared) ⚖️',
            "Appointment on {$appointment->appointment_date->toDateString()} at {$appointment->start_time} with {$appointment->customer_name} is confirmed and payment is cleared.",
            'appointment',
            '/lawyer'
        );

        return response()->json(['message' => 'Consultation payment approved and appointment confirmed.', 'data' => $appointment->fresh(['lawyer', 'payment'])]);
    }

    private function findAvailableSlot(int $lawyerId, string $date, string $startTime, ?int $ignoreAppointmentId = null): ?array
    {
        $wanted = Carbon::parse($startTime)->format('H:i');

        foreach ($this->slotsForDate($lawyerId, $date, $ignoreAppointmentId) as $slot) {
            if ($slot['start_time'] === $wanted) {
                return [
                    'start_time' => $slot['start_time'].':00',
                    'end_time' => $slot['end_time'].':00',
                ];
            }
        }

        return null;
    }

    private function validateAvailability(Request $request): array
    {
        return $request->validate([
            'weekday' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_minutes' => 'required|integer|min:15|max:180',
        ]);
    }

    private function slotsForDate(int $lawyerId, string $date, ?int $ignoreAppointmentId = null): array
    {
        $day = Carbon::parse($date);

        $isBlocked = LawyerUnavailableDate::where('lawyer_id', $lawyerId)
            ->whereDate('date', $day->toDateString())
            ->exists();

        if ($isBlocked) {
            return [];
        }

        $windows = LawyerAvailability::where('lawyer_id', $lawyerId)
            ->where('weekday', $day->dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get();

        $takenQuery = Appointment::where('lawyer_id', $lawyerId)
            ->whereDate('appointment_date', $day->toDateString())
            ->whereIn('status', ['pending', 'confirmed', 'rescheduled']);

        if ($ignoreAppointmentId) {
            $takenQuery->where('id', '!=', $ignoreAppointmentId);
        }

        $taken = $takenQuery->pluck('start_time')
            ->map(fn ($time) => Carbon::parse($time)->format('H:i'))
            ->all();

        $slots = [];

        foreach ($windows as $window) {
            $cursor = Carbon::parse($window->start_time);
            $windowEnd = Carbon::parse($window->end_time);

            while ($cursor->copy()->addMinutes($window->slot_minutes)->lte($windowEnd)) {
                $slotStart = $cursor->format('H:i');
                $slotEnd = $cursor->copy()->addMinutes($window->slot_minutes)->format('H:i');

                if (! in_array($slotStart, $taken, true)) {
                    $slots[] = [
                        'start_time' => $slotStart,
                        'end_time' => $slotEnd,
                        'label' => $slotStart.' - '.$slotEnd,
                    ];
                }

                $cursor->addMinutes($window->slot_minutes);
            }
        }

        return $slots;
    }
}
