<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'status',
        'subtotal_cents',
        'discount_total_cents',
        'tax_total_cents',
        'shipping_total_cents',
        'total_cents',
        'currency',
        'billing_address',
        'shipping_address',
        'placed_at',
        'notes',
        'payment_failure_reason',
        'payment_gateway',
        'payment_id',
        'payment_status',
        'tracking_number',
        'shipped_at',
    ];

    protected $casts = [
        // The vocabulary lives in the enum, not the column. Casting here is
        // what enforces it: assigning a status outside OrderStatus throws
        // on write instead of quietly persisting a value nothing reacts to.
        'status' => OrderStatus::class,
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'placed_at' => 'datetime',
        'shipped_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shipmentLabels(): HasMany
    {
        return $this->hasMany(ShipmentLabel::class);
    }
}
