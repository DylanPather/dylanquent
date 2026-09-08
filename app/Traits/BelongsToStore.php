<?php

namespace App\Traits;

use App\Models\Store;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToStore
{
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function scopeForStore(Builder $query, ?Store $store = null): Builder
    {
        $store = $store ?? app('currentStore');

        if ($store) {
            return $query->where('store_id', $store->id);
        }

        return $query;
    }

    protected static function bootBelongsToStore(): void
    {
        static::creating(function ($model) {
            if (!$model->store_id) {
                $model->store_id = app('currentStore')?->id;
            }
        });

        static::addGlobalScope('store', function (Builder $builder) {
            if (app('currentStore')) {
                $builder->where('store_id', app('currentStore')->id);
            }
        });
    }
}
