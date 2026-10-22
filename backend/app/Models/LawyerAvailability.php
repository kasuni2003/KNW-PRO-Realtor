<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LawyerAvailability extends Model
{
    use HasFactory;

    protected $table = 'lawyer_availability';

    protected $fillable = [
        'lawyer_id',
        'weekday',
        'start_time',
        'end_time',
        'slot_minutes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
