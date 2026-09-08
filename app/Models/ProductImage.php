<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'url', 'sort_order', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Rows hold either a disk-relative path (uploads) or an absolute
     * public URL (seeded assets under public/). Resolve both to something
     * the browser can load, so uploads work on local disk or S3/R2 alike.
     */
    public function getUrlAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/')) {
            return $value;
        }

        return Storage::disk(config('filesystems.default'))->url($value);
    }

    /**
     * The stored value, for deleting the underlying file.
     */
    public function storagePath(): ?string
    {
        return $this->getRawOriginal('url');
    }
}
