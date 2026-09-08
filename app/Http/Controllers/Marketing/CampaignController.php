<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = collect([
            ['id' => 1, 'name' => 'Summer Sale 2025', 'type' => 'email', 'status' => 'active', 'sent' => 2543, 'opens' => 856, 'clicks' => 234, 'created_at' => 'May 15, 2025'],
            ['id' => 2, 'name' => 'Flash Deal - 24 Hours', 'type' => 'sms', 'status' => 'active', 'sent' => 5234, 'opens' => 2341, 'clicks' => 891, 'created_at' => 'May 20, 2025'],
            ['id' => 3, 'name' => 'New Product Launch', 'type' => 'email', 'status' => 'scheduled', 'sent' => 0, 'opens' => 0, 'clicks' => 0, 'created_at' => 'May 18, 2025'],
            ['id' => 4, 'name' => 'Cart Abandonment Reminder', 'type' => 'email', 'status' => 'active', 'sent' => 1234, 'opens' => 234, 'clicks' => 45, 'created_at' => 'May 10, 2025'],
        ]);

        $totalCampaigns = $campaigns->count();
        $activeCampaigns = $campaigns->where('status', 'active')->count();
        $totalSent = $campaigns->sum('sent');
        $totalRevenue = $campaigns->sum('clicks') * 50; // Estimated

        return Inertia::render('marketing/campaigns/index', [
            'campaigns' => $campaigns,
            'stats' => [
                'total_campaigns' => $totalCampaigns,
                'active_campaigns' => $activeCampaigns,
                'total_sent' => $totalSent,
                'total_revenue' => $totalRevenue,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/campaigns/create', [
            'types' => ['email', 'sms', 'push', 'in-app'],
            'templates' => [
                'promotional',
                'newsletter',
                'welcome',
                'cart_abandonment',
                'order_confirmation',
                'product_recommendation',
            ],
        ]);
    }
}
