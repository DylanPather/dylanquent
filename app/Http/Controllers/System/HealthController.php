<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\TrafficStat;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HealthController extends Controller
{
    public function __invoke(): Response
    {
        $from = now()->subDays(6)->startOfDay();
        $stats = TrafficStat::query()
            ->where('visited_at', '>=', $from)
            ->get(['date','duration_ms'])
            ->groupBy('date')
            ->map(function ($rows, $date) {
                $count = $rows->count();
                $avg = $count ? (int) round($rows->avg('duration_ms')) : 0;
                return ['date' => $date, 'requests' => $count, 'avg_duration_ms' => $avg];
            })->values()->all();

        return Inertia::render('system/health', [
            'windowDays' => 7,
            'traffic' => $stats,
        ]);
    }
}

