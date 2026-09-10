<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'barcode',
        'image_url',
        'attributes',
        'price_cents',
        'compare_at_price_cents',
        'track_inventory',
        'stock_quantity',
        'low_stock_threshold',
        'is_active',
    ];

    protected $casts = [
        'attributes' => 'array',
        'track_inventory' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryLevels(): HasMany
    {
        return $this->hasMany(InventoryLevel::class);
    }

    /**
     * This variant's angles — front, back, detail — in the order they should
     * be shown. `image_url` stays the one that leads: cart lines and product
     * cards need a single shot without loading a gallery to find it.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_variant_id')
            ->orderByDesc('is_primary')
            ->orderBy('sort_order');
    }

    public function getTotalStockAttribute(): int
    {
        return (int) $this->inventoryLevels()->sum('quantity');
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->total_stock <= $this->low_stock_threshold;
    }

    public function isAvailable(int $quantity = 1): bool
    {
        return $this->total_stock >= $quantity;
    }
}

