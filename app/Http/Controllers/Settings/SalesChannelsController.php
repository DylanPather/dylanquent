<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SalesChannelsController extends Controller
{
    public function index()
    {
        $channels = collect([
            ['id' => 1, 'name' => 'Web Store', 'type' => 'web', 'status' => 'active', 'orders' => 523, 'revenue' => 125600.50],
            ['id' => 2, 'name' => 'Mobile App', 'type' => 'mobile', 'status' => 'active', 'orders' => 234, 'revenue' => 56780.25],
            ['id' => 3, 'name' => 'Instagram Shop', 'type' => 'social', 'status' => 'connected', 'orders' => 89, 'revenue' => 23450.00],
            ['id' => 4, 'name' => 'Facebook Marketplace', 'type' => 'social', 'status' => 'inactive', 'orders' => 0, 'revenue' => 0],
        ]);

        return Inertia::render('settings/sales-channels', [
            'channels' => $channels,
            'stats' => [
                'total_channels' => 4,
                'active' => 3,
                'total_orders' => 846,
                'total_revenue' => 205831.75,
            ],
        ]);
    }

    public function show($channelId)
    {
        return Inertia::render('settings/sales-channels/show');
    }

    public function edit($channelId)
    {
        return Inertia::render('settings/sales-channels/edit');
    }
}
