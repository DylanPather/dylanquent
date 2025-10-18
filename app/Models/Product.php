<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'price_cents',
        'compare_at_price_cents',
        'currency',
        'track_inventory',
        'stock_quantity',
        'low_stock_threshold',
        'is_active',
        'attributes',
    ];

    protected $casts = [
        'attributes' => 'array',
        'track_inventory' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class)->withTimestamps();
    }
}
