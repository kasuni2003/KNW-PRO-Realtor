<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerPropertyDraft extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'seller_name',
        'seller_email',
        'property_type',
        'district',
        'expected_price',
        'contact_number',
        'description',
        'preferred_visit_date',
        'visit_dates',
        'visit_days',
        'visit_time',
        'location_url',
        'latitude',
        'longitude',
        'documents',
        'deed_document_path',
        'survey_plan_path',
        'council_document_path',
        'other_document_path',
        'property_images',
        'listing_plan',
        'listing_fee',
        'payment_status',
        'payment_method',
        'payment_reference',
        'payment_slip_path',
        'payment_note',
        'online_payment_provider',
        'online_payment_reference',
        'paid_at',
        'terms_accepted',
        'visit_permission',
        'review_acknowledged',
        'status',
        'legal_status',
        'legal_review_note',
        'legal_reviewed_at',
        'is_deed_verified',
        'deed_verified_at',
        'deed_verified_by',
        'deed_verification_note',
        'rejection_reason',
        'reviewed_at',
        'reviewed_by',
        'published_at',
    ];

    protected $casts = [
        'documents' => 'array',
        'property_images' => 'array',
        'visit_dates' => 'array',
        'visit_days' => 'array',
        'terms_accepted' => 'boolean',
        'visit_permission' => 'boolean',
        'review_acknowledged' => 'boolean',
        'is_deed_verified' => 'boolean',
        'preferred_visit_date' => 'date',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'paid_at' => 'datetime',
        'deed_verified_at' => 'datetime',
        'legal_reviewed_at' => 'datetime',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function deedVerifier()
    {
        return $this->belongsTo(User::class, 'deed_verified_by');
    }

    public function inquiries()
    {
        return $this->hasMany(PropertyInquiry::class, 'seller_property_draft_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'seller_property_draft_id');
    }

    public function savedByUsers()
    {
        return $this->hasMany(SavedProperty::class, 'seller_property_draft_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'seller_property_draft_id');
    }
}
