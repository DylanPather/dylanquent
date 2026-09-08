<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectInquiry extends Model
{
    use HasFactory;

    public const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

    protected $fillable = [
        'name',
        'email',
        'company',
        'phone',
        'project_type',
        'budget_range',
        'timeline',
        'message',
        'status',
        'internal_notes',
        'source',
        'ip_address',
        'contacted_at',
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
    ];

    public function scopeOpen($query)
    {
        return $query->whereNotIn('status', ['won', 'lost']);
    }
}
