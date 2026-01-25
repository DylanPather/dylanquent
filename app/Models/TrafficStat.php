<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrafficStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'date', 'path', 'method', 'status', 'duration_ms', 'user_id', 'visited_at'
    ];
}

