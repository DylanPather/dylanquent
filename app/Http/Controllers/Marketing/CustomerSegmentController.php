<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CustomerSegmentController extends Controller
{
    public function index()
    {
        $segments = collect([
            ['id' => 1, 'name' => 'High Value Customers', 'size' => 245, 'ltv' => 2500, 'status' => 'active', 'created_at' => 'March 15, 2025'],
            ['id' => 2, 'name' => 'New Customers', 'size' => 567, 'ltv' => 450, 'status' => 'active', 'created_at' => 'April 01, 2025'],
            ['id' => 3, 'name' => 'At Risk', 'size' => 123, 'ltv' => 800, 'status' => 'active', 'created_at' => 'April 15, 2025'],
            ['id' => 4, 'name' => 'VIP Loyalty', 'size' => 89, 'ltv' => 4200, 'status' => 'active', 'created_at' => 'March 01, 2025'],
        ])->all();

        return Inertia::render('marketing/segments/index', [
            'segments' => $segments,
            'stats' => [
                'total_segments' => 4,
                'active' => 4,
                'total_customers' => 1024,
                'avg_ltv' => 1987.50,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/segments/create', [
            'conditions' => ['Total Orders', 'LTV', 'Last Purchase', 'Email Engaged', 'Avg Order Value'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Segment created successfully']);
    }
}
