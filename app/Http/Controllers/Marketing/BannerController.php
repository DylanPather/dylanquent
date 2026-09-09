<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $banners = collect([
            ['id' => 1, 'title' => 'Summer Sale - 30% Off', 'type' => 'header', 'status' => 'active', 'views' => 12456, 'clicks' => 856, 'ctr' => '6.8%', 'created_at' => 'May 15, 2025'],
            ['id' => 2, 'title' => 'Free Shipping on Orders over R500', 'type' => 'floating', 'status' => 'active', 'views' => 8934, 'clicks' => 445, 'ctr' => '4.9%', 'created_at' => 'May 18, 2025'],
            ['id' => 3, 'title' => 'New Collection Available', 'type' => 'popup', 'status' => 'inactive', 'views' => 5000, 'clicks' => 250, 'ctr' => '5.0%', 'created_at' => 'May 10, 2025'],
        ]);

        return Inertia::render('marketing/banners/index', [
            'sampleData' => true,
            'banners' => $banners,
            'stats' => [
                'total_banners' => $banners->count(),
                'active' => $banners->where('status', 'active')->count(),
                'total_views' => (int)$banners->sum('views'),
                'avg_ctr' => '5.6%',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('marketing/banners/create', [
            'sampleData' => true,
            'types' => ['header', 'floating', 'popup', 'sidebar'],
            'positions' => ['top', 'bottom', 'left', 'right', 'center'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Banner created successfully']);
    }
}
