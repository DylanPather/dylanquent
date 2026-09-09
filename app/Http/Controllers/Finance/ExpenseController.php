<?php

namespace App\Http\Controllers\Finance;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = collect([
            ['id' => 1, 'date' => 'May 20, 2025', 'category' => 'Shipping', 'description' => 'Courier service', 'amount' => 2450.50, 'status' => 'paid'],
            ['id' => 2, 'date' => 'May 15, 2025', 'category' => 'Supplies', 'description' => 'Packaging materials', 'amount' => 890.00, 'status' => 'paid'],
            ['id' => 3, 'date' => 'May 10, 2025', 'category' => 'Marketing', 'description' => 'Facebook ads', 'amount' => 1500.00, 'status' => 'paid'],
            ['id' => 4, 'date' => 'May 05, 2025', 'category' => 'Utilities', 'description' => 'Hosting fee', 'amount' => 299.99, 'status' => 'paid'],
        ]);

        $stats = [
            'total_expenses' => (int)$expenses->sum('amount'),
            'this_month' => 5140.49,
            'by_category' => [
                'Shipping' => 2450.50,
                'Supplies' => 890.00,
                'Marketing' => 1500.00,
                'Utilities' => 299.99,
            ],
            'avg_expense' => round($expenses->avg('amount'), 2),
        ];

        return Inertia::render('finance/expenses/index', [
            'sampleData' => true,
            'expenses' => $expenses,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('finance/expenses/create', [
            'sampleData' => true,
            'categories' => ['Shipping', 'Supplies', 'Marketing', 'Utilities', 'Salaries', 'Equipment', 'Other'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Expense recorded successfully']);
    }
}
