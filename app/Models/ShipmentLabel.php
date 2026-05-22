<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentLabel extends Model
{
    protected $fillable = [
        'order_id',
        'carrier',
        'tracking_number',
        'label_url',
        'weight_oz',
        'service_type',
        'cost_cents',
        'generated_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'generated_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
