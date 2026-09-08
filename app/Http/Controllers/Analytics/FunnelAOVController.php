<?php

namespace App\Http\Controllers\Analytics;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FunnelAOVController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', 'last_30');

        return Inertia::render('analytics/funnel-aov/index', [
            'period' => $period,
            'funnel' => [
                ['stage' => 'Website Visitors', 'count' => 12450, 'conversion' => '100%'],
                ['stage' => 'Added to Cart', 'count' => 1856, 'conversion' => '14.9%'],
                ['stage' => 'Started Checkout', 'count' => 1245, 'conversion' => '67.1%'],
                ['stage' => 'Completed Purchase', 'count' => 987, 'conversion' => '79.2%'],
            ],
            'stats' => [
                'conversion_rate' => '7.9%',
                'avg_order_value' => 385.50,
                'cart_abandonment' => '32.9%',
                'avg_cart_value' => 142.75,
            ],
            'daily_aov' => [
                ['date' => 'Day 1', 'aov' => 350],
                ['date' => 'Day 2', 'aov' => 365],
                ['date' => 'Day 3', 'aov' => 342],
                ['date' => 'Day 4', 'aov' => 380],
                ['date' => 'Day 5', 'aov' => 395],
                ['date' => 'Day 6', 'aov' => 410],
                ['date' => 'Day 7', 'aov' => 405],
            ],
        ]);
    }
}
