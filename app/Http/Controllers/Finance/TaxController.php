<?php

namespace App\Http\Controllers\Finance;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TaxController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', 'mtd');

        $taxes = collect([
            ['id' => 1, 'period' => 'May 2025', 'sales' => 125600.00, 'rate' => '15%', 'amount' => 18840.00, 'status' => 'pending', 'due_date' => 'May 31, 2025'],
            ['id' => 2, 'period' => 'April 2025', 'sales' => 98450.75, 'rate' => '15%', 'amount' => 14767.61, 'status' => 'paid', 'due_date' => 'April 30, 2025', 'paid_date' => 'April 28, 2025'],
            ['id' => 3, 'period' => 'March 2025', 'sales' => 112300.50, 'rate' => '15%', 'amount' => 16845.08, 'status' => 'paid', 'due_date' => 'March 31, 2025', 'paid_date' => 'March 29, 2025'],
        ]);

        $stats = [
            'ytd_sales' => 336351.25,
            'ytd_tax_liability' => 50452.69,
            'pending_amount' => 18840.00,
            'tax_rate' => '15%',
        ];

        return Inertia::render('finance/taxes/index', [
            'taxes' => $taxes,
            'stats' => $stats,
            'period' => $period,
        ]);
    }

    public function show($taxId)
    {
        $tax = collect([
            'id' => $taxId,
            'period' => 'May 2025',
            'sales' => 125600.00,
            'rate' => '15%',
            'amount' => 18840.00,
            'status' => 'pending',
            'due_date' => 'May 31, 2025',
            'transactions' => [
                ['date' => '2025-05-01', 'type' => 'Sale', 'amount' => 8500.00],
                ['date' => '2025-05-05', 'type' => 'Sale', 'amount' => 6750.50],
                ['date' => '2025-05-10', 'type' => 'Refund', 'amount' => -500.00],
            ],
        ])->all();

        return Inertia::render('finance/taxes/show', [
            'tax' => $tax,
        ]);
    }

    public function process(Request $request, $taxId)
    {
        return response()->json(['message' => 'Tax payment processed successfully']);
    }
}
