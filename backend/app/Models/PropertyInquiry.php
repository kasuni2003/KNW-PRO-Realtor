<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_property_draft_id',
        'seller_id',
        'buyer_id',
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'message',
        'is_site_visit',
        'visit_date',
        'visit_slot',
        'visit_status',
        'reschedule_date',
        'reschedule_slot',
        'status',
        'admin_note',
        'seller_note',
    ];

    protected $casts = [
        'is_site_visit' => 'boolean',
        'visit_date' => 'date',
        'reschedule_date' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(SellerPropertyDraft::class, 'seller_property_draft_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
