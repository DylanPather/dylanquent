<?php

namespace App\Http\Controllers\Finance;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PayoutController extends Controller
{
    public function index(Request $request)
    {
        $payouts = collect([
            ['id' => 1, 'payout_date' => 'May 15, 2025', 'amount' => 15234.50, 'status' => 'completed', 'method' => 'Bank Transfer', 'reference' => 'BAT-05-15-001'],
            ['id' => 2, 'payout_date' => 'May 1, 2025', 'amount' => 12456.75, 'status' => 'completed', 'method' => 'Bank Transfer', 'reference' => 'BAT-05-01-001'],
            ['id' => 3, 'payout_date' => 'Apr 15, 2025', 'amount' => 18945.00, 'status' => 'completed', 'method' => 'Bank Transfer', 'reference' => 'BAT-04-15-001'],
            ['id' => 4, 'payout_date' => 'Apr 1, 2025', 'amount' => 16234.25, 'status' => 'completed', 'method' => 'Bank Transfer', 'reference' => 'BAT-04-01-001'],
        ]);

        $totalPayouts = $payouts->count();
        $totalAmount = $payouts->sum('amount');
        $completedPayouts = $payouts->where('status', 'completed')->count();
        $pendingAmount = 0;

        return Inertia::render('finance/payouts/index', [
            'payouts' => $payouts,
            'stats' => [
                'total_payouts' => $totalPayouts,
                'total_amount' => $totalAmount,
                'completed_payouts' => $completedPayouts,
                'pending_amount' => $pendingAmount,
            ],
        ]);
    }
}
