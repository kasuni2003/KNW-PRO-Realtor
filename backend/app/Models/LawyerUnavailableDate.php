<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LawyerUnavailableDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'lawyer_id',
        'date',
        'reason',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
