<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedProperty extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seller_property_draft_id',
        'note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(SellerPropertyDraft::class, 'seller_property_draft_id');
    }
}
