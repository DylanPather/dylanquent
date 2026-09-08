<?php

namespace App\Http\Controllers\Analytics;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CohortsLTVController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('analytics/cohorts-ltv/index', [
            'cohorts' => [
                ['month' => 'January 2025', 'customers' => 245, 'ltv' => 850.50, 'retention_3m' => '68%', 'retention_6m' => '52%'],
                ['month' => 'February 2025', 'customers' => 312, 'ltv' => 920.75, 'retention_3m' => '72%', 'retention_6m' => null],
                ['month' => 'March 2025', 'customers' => 289, 'ltv' => 780.25, 'retention_3m' => '65%', 'retention_6m' => null],
                ['month' => 'April 2025', 'customers' => 356, 'ltv' => 895.00, 'retention_3m' => '71%', 'retention_6m' => null],
                ['month' => 'May 2025', 'customers' => 423, 'ltv' => null, 'retention_3m' => null, 'retention_6m' => null],
            ],
            'stats' => [
                'avg_ltv' => 889.50,
                'best_cohort' => 'April 2025',
                'total_customers' => 1625,
                'avg_retention_3m' => '69%',
            ],
        ]);
    }
}
