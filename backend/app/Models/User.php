<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'seller_status',
        'phone',
        'nic_number',
        'nic_document_path',
        'address',
        'rejection_reason',
        'approved_at',
        'approved_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'approved_at'       => 'datetime',
        'password'          => 'hashed',
    ];

    // ─── Role checks ────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isLawyer(): bool
    {
        return $this->role === 'lawyer';
    }

    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }

    public function isBuyer(): bool
    {
        return $this->role === 'buyer';
    }

    // Admin or Staff can manage users/listings
    public function canManage(): bool
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    // ─── Status checks ───────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    // Seller who is active can create listings
    public function canListProperty(): bool
    {
        if ($this->isAdmin() || $this->isStaff()) {
            return true;
        }
        if ($this->isSeller() && $this->isActive()) {
            return true;
        }
        return $this->seller_status === 'active';
    }

    public function isApprovedSeller(): bool
    {
        return ($this->isSeller() && $this->isActive()) || $this->seller_status === 'active';
    }

    public function isPendingSeller(): bool
    {
        return ($this->isSeller() && $this->isPending()) || $this->seller_status === 'pending';
    }

    // ─── Relationships ───────────────────────────────────────────────────────

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvedUsers()
    {
        return $this->hasMany(User::class, 'approved_by');
    }

    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }

    public function lawyerProfile()
    {
        return $this->hasOne(LawyerProfile::class);
    }

    public function lawyerAvailability()
    {
        return $this->hasMany(LawyerAvailability::class, 'lawyer_id');
    }

    public function lawyerUnavailableDates()
    {
        return $this->hasMany(LawyerUnavailableDate::class, 'lawyer_id');
    }

    public function lawyerAppointments()
    {
        return $this->hasMany(Appointment::class, 'lawyer_id');
    }

    public function sellerPropertyDrafts()
    {
        return $this->hasMany(SellerPropertyDraft::class, 'seller_id');
    }

    public function propertyInquiries()
    {
        return $this->hasMany(PropertyInquiry::class, 'seller_id');
    }

    public function savedProperties()
    {
        return $this->hasMany(SavedProperty::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class)->orderByDesc('created_at');
    }
}
