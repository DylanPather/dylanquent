<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EmailCampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = collect([
            ['id' => 1, 'name' => 'Summer Sale 2025', 'status' => 'active', 'sent' => 2543, 'opens' => 856, 'click_rate' => '12.5%', 'created_at' => 'May 15, 2025'],
            ['id' => 2, 'name' => 'New Product Launch', 'status' => 'scheduled', 'sent' => 0, 'opens' => 0, 'click_rate' => '—', 'created_at' => 'May 18, 2025'],
            ['id' => 3, 'name' => 'Abandoned Cart Reminder', 'status' => 'active', 'sent' => 1234, 'opens' => 234, 'click_rate' => '8.2%', 'created_at' => 'May 10, 2025'],
        ]);

        return Inertia::render('marketing/email/index', [
            'campaigns' => $campaigns,
            'stats' => [
                'total_campaigns' => $campaigns->count(),
                'active' => $campaigns->where('status', 'active')->count(),
                'total_sent' => (int)$campaigns->sum('sent'),
                'avg_open_rate' => '28.4%',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/email/create', [
            'templates' => ['promotional', 'newsletter', 'welcome', 'cart_abandonment', 'order_confirmation'],
            'segments' => ['All Customers', 'VIP Customers', 'New Customers', 'Inactive Customers'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Email campaign created successfully']);
    }
}
