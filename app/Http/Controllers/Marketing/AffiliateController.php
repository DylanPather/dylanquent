<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    public function index(Request $request)
    {
        $affiliates = collect([
            ['id' => 1, 'name' => 'Sarah Tech Blog', 'email' => 'sarah@techblog.com', 'status' => 'active', 'commission' => '10%', 'revenue' => 12450.50, 'clicks' => 1245],
            ['id' => 2, 'name' => 'Fashion Influencer', 'email' => 'fashion@insta.com', 'status' => 'active', 'commission' => '15%', 'revenue' => 8950.75, 'clicks' => 892],
            ['id' => 3, 'name' => 'Gaming Channel', 'email' => 'gaming@youtube.com', 'status' => 'pending', 'commission' => '10%', 'revenue' => 0, 'clicks' => 0],
            ['id' => 4, 'name' => 'Lifestyle Blogger', 'email' => 'lifestyle@blog.com', 'status' => 'inactive', 'commission' => '10%', 'revenue' => 5230.00, 'clicks' => 523],
        ]);

        return Inertia::render('marketing/affiliates/index', [
            'affiliates' => $affiliates,
            'stats' => [
                'total_affiliates' => $affiliates->count(),
                'active' => $affiliates->where('status', 'active')->count(),
                'total_revenue' => (int)$affiliates->sum('revenue'),
                'total_clicks' => (int)$affiliates->sum('clicks'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/affiliates/create');
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Affiliate created successfully']);
    }

    public function show($affiliateId)
    {
        $affiliate = collect([
            'id' => $affiliateId,
            'name' => 'Sarah Tech Blog',
            'email' => 'sarah@techblog.com',
            'status' => 'active',
            'commission' => '10%',
            'revenue' => 12450.50,
            'clicks' => 1245,
            'conversions' => 234,
            'conversion_rate' => '18.8%',
            'created_at' => 'March 15, 2025',
        ]);

        return Inertia::render('marketing/affiliates/show', [
            'affiliate' => $affiliate,
        ]);
    }
}
