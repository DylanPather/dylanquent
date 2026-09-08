<?php

namespace App\Http\Controllers\Analytics;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RFMAnalysisController extends Controller
{
    public function index()
    {
        $segments = collect([
            ['segment' => 'Champions', 'count' => 45, 'recency' => '1-7 days', 'frequency' => 'Monthly', 'monetary' => 'R3000+', 'percentage' => '4.4%'],
            ['segment' => 'Loyal Customers', 'count' => 134, 'recency' => '1-30 days', 'frequency' => 'Quarterly', 'monetary' => 'R1500-3000', 'percentage' => '13.1%'],
            ['segment' => 'Potential Loyalists', 'count' => 234, 'recency' => '30-60 days', 'frequency' => 'Semi-Yearly', 'monetary' => 'R500-1500', 'percentage' => '22.8%'],
            ['segment' => 'At Risk', 'count' => 123, 'recency' => '60-90 days', 'frequency' => 'Yearly', 'monetary' => 'R200-500', 'percentage' => '12.0%'],
            ['segment' => 'Cannot Lose Them', 'count' => 89, 'recency' => '90+ days', 'frequency' => 'Rarely', 'monetary' => 'R500-2000', 'percentage' => '8.7%'],
            ['segment' => 'Lost', 'count' => 375, 'recency' => '90+ days', 'frequency' => 'One-time', 'monetary' => 'R50-500', 'percentage' => '36.6%'],
        ])->all();

        return Inertia::render('analytics/rfm-analysis/index', [
            'segments' => $segments,
            'stats' => [
                'total_customers' => 1024,
                'avg_recency' => '45 days',
                'avg_frequency' => '3.2x/year',
                'avg_monetary' => 'R1245.50',
            ],
        ]);
    }
}
