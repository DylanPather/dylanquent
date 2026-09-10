<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'thumbnail_url',
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

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * The product's own gallery.
     *
     * Variant angles live in the same table keyed by product_variant_id; they
     * belong to the variant, not here, or every shot of every print would show
     * up in the product gallery and in the card previews.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)
            ->whereNull('product_variant_id')
            ->orderBy('sort_order');
    }

    /** Every shot of this product, its variants' angles included. */
    public function allImages(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }
}
