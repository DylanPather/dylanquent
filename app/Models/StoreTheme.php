<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreTheme extends Model
{
    protected $fillable = [
        'store_id',
        'primary_color',
        'secondary_color',
        'accent_color',
        'background_color',
        'text_color',
        'font_family',
        'logo_url',
        'favicon_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function getThemeVariables(): array
    {
        return [
            '--primary-color' => $this->primary_color ?? '#000000',
            '--secondary-color' => $this->secondary_color ?? '#666666',
            '--accent-color' => $this->accent_color ?? '#3b82f6',
            '--background-color' => $this->background_color ?? '#ffffff',
            '--text-color' => $this->text_color ?? '#1f2937',
            '--font-family' => $this->font_family ?? 'system-ui, -apple-system, sans-serif',
        ];
    }
}
