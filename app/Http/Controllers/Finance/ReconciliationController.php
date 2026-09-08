<?php

namespace App\Http\Controllers\Finance;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReconciliationController extends Controller
{
    public function index(Request $request)
    {
        $reconciliations = collect([
            ['id' => 1, 'period' => 'May 1-15, 2025', 'status' => 'completed', 'expected' => 28950.50, 'actual' => 28950.50, 'variance' => 0],
            ['id' => 2, 'period' => 'April 16-30, 2025', 'status' => 'completed', 'expected' => 35670.75, 'actual' => 35670.75, 'variance' => 0],
            ['id' => 3, 'period' => 'April 1-15, 2025', 'status' => 'completed', 'expected' => 32145.25, 'actual' => 32145.25, 'variance' => 0],
            ['id' => 4, 'period' => 'May 16-31, 2025', 'status' => 'pending', 'expected' => 31200.00, 'actual' => 0, 'variance' => 0],
        ]);

        $stats = [
            'total_reconciled' => 96766.50,
            'pending_reconciliation' => 31200.00,
            'variances' => 0,
            'accuracy' => '100%',
        ];

        return Inertia::render('finance/reconciliation/index', [
            'reconciliations' => $reconciliations,
            'stats' => $stats,
        ]);
    }

    public function show($reconciliationId)
    {
        $reconciliation = collect([
            'id' => $reconciliationId,
            'period' => 'May 1-15, 2025',
            'status' => 'completed',
            'expected' => 28950.50,
            'actual' => 28950.50,
            'variance' => 0,
            'transactions' => [
                ['date' => '2025-05-01', 'type' => 'Sale', 'amount' => 450.00, 'status' => 'Matched'],
                ['date' => '2025-05-02', 'type' => 'Refund', 'amount' => -75.50, 'status' => 'Matched'],
                ['date' => '2025-05-05', 'type' => 'Sale', 'amount' => 320.00, 'status' => 'Matched'],
            ],
        ])->all();

        return Inertia::render('finance/reconciliation/show', [
            'reconciliation' => $reconciliation,
        ]);
    }

    public function process(Request $request, $reconciliationId)
    {
        return response()->json(['message' => 'Reconciliation processed successfully']);
    }
}
