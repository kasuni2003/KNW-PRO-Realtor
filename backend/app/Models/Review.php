<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seller_property_draft_id',
        'name',
        'email',
        'role_label',
        'country',
        'rating',
        'title',
        'comment',
        'type',
        'status',
        'verified',
        'helpful_count',
        'admin_note',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'verified' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(SellerPropertyDraft::class, 'seller_property_draft_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
