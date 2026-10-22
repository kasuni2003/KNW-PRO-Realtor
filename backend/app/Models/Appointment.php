<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lawyer_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'appointment_date',
        'start_time',
        'end_time',
        'topic',
        'consultation_type',
        'office_location',
        'fee_amount',
        'platform_commission',
        'lawyer_earnings',
        'payment_method',
        'payment_status',
        'bank_slip_url',
        'user_role',
        'message',
        'status',
        'lawyer_note',
        'admin_note',
        'video_meeting_url',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'fee_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'lawyer_earnings' => 'decimal:2',
    ];

    public function lawyer()
    {
        return $this->belongsTo(User::class, 'lawyer_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
