<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SMSCampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = collect([
            ['id' => 1, 'name' => 'Flash Deal - 24 Hours', 'status' => 'active', 'sent' => 5234, 'delivered' => 5100, 'clicks' => 891, 'created_at' => 'May 20, 2025'],
            ['id' => 2, 'name' => 'Order Tracking Update', 'status' => 'active', 'sent' => 3456, 'delivered' => 3401, 'clicks' => 456, 'created_at' => 'May 19, 2025'],
            ['id' => 3, 'name' => 'Back in Stock Alert', 'status' => 'scheduled', 'sent' => 0, 'delivered' => 0, 'clicks' => 0, 'created_at' => 'May 18, 2025'],
        ])->all();

        return Inertia::render('marketing/sms/index', [
            'campaigns' => $campaigns,
            'stats' => [
                'total_campaigns' => $campaigns->count(),
                'active' => $campaigns->where('status', 'active')->count(),
                'total_sent' => (int)$campaigns->sum('sent'),
                'delivery_rate' => '97.4%',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/sms/create', [
            'templates' => ['promotional', 'reminder', 'welcome', 'back_in_stock', 'shipping_update'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'SMS campaign created successfully']);
    }
}
