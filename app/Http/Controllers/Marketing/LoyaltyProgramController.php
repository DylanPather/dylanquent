<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LoyaltyProgramController extends Controller
{
    public function index()
    {
        $members = collect([
            ['id' => 1, 'name' => 'John Doe', 'tier' => 'Gold', 'points' => 2450, 'lifetime_spent' => 5000, 'joined_at' => 'March 15, 2025'],
            ['id' => 2, 'name' => 'Jane Smith', 'tier' => 'Silver', 'points' => 1200, 'lifetime_spent' => 2500, 'joined_at' => 'April 01, 2025'],
            ['id' => 3, 'name' => 'Bob Johnson', 'tier' => 'Gold', 'points' => 3850, 'lifetime_spent' => 7200, 'joined_at' => 'February 20, 2025'],
            ['id' => 4, 'name' => 'Alice Brown', 'tier' => 'Bronze', 'points' => 450, 'lifetime_spent' => 750, 'joined_at' => 'May 01, 2025'],
        ]);

        return Inertia::render('marketing/loyalty/index', [
            'members' => $members,
            'stats' => [
                'total_members' => 4,
                'gold_tier' => 2,
                'total_points_issued' => 7950,
                'avg_lifetime_value' => 3862.50,
            ],
        ]);
    }

    public function settings()
    {
        $settings = collect([
            'points_per_dollar' => 1,
            'bronze_threshold' => 500,
            'silver_threshold' => 2500,
            'gold_threshold' => 5000,
            'point_expiry_months' => 12,
            'enabled' => true,
        ]);

        return Inertia::render('marketing/loyalty/settings', [
            'settings' => $settings,
        ]);
    }

    public function updateSettings(Request $request)
    {
        return response()->json(['message' => 'Loyalty program settings updated']);
    }
}
