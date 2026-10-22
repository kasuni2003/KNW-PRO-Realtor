<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seller_property_draft_id',
        'appointment_id',
        'provider',
        'order_id',
        'plan',
        'amount',
        'currency',
        'status',
        'payer_name',
        'payer_email',
        'payer_phone',
        'payment_reference',
        'gateway_payload',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_payload' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(SellerPropertyDraft::class, 'seller_property_draft_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
