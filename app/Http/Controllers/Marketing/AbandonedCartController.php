<?php

namespace App\Http\Controllers\Marketing;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AbandonedCartController extends Controller
{
    public function index()
    {
        $carts = collect([
            ['id' => 1, 'customer' => 'John Doe', 'email' => 'john@example.com', 'value' => 450.50, 'items' => 3, 'abandoned_at' => 'May 19, 2025', 'status' => 'pending'],
            ['id' => 2, 'customer' => 'Jane Smith', 'email' => 'jane@example.com', 'value' => 325.75, 'items' => 2, 'abandoned_at' => 'May 18, 2025', 'status' => 'recovered'],
            ['id' => 3, 'customer' => 'Bob Johnson', 'email' => 'bob@example.com', 'value' => 890.00, 'items' => 5, 'abandoned_at' => 'May 20, 2025', 'status' => 'pending'],
            ['id' => 4, 'customer' => 'Alice Brown', 'email' => 'alice@example.com', 'value' => 156.25, 'items' => 1, 'abandoned_at' => 'May 15, 2025', 'status' => 'expired'],
        ]);

        return Inertia::render('marketing/abandoned-carts/index', [
            'carts' => $carts,
            'stats' => [
                'total_abandoned' => 4,
                'pending_recovery' => 2,
                'recovered' => 1,
                'total_value' => 1822.50,
            ],
        ]);
    }

    public function recover($cartId)
    {
        return response()->json(['message' => 'Recovery email sent successfully']);
    }
}
