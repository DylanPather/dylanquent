<?php

namespace App\Http\Controllers\Fulfillment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReturnsController extends Controller
{
    public function index(Request $request)
    {
        $returns = collect([
            ['id' => 1, 'return_number' => 'RET-001', 'order_number' => 'ORD-001', 'customer' => 'John Doe', 'reason' => 'Wrong size', 'status' => 'requested', 'created_at' => 'May 15, 2025'],
            ['id' => 2, 'return_number' => 'RET-002', 'order_number' => 'ORD-002', 'customer' => 'Jane Smith', 'reason' => 'Damaged item', 'status' => 'approved', 'created_at' => 'May 14, 2025'],
            ['id' => 3, 'return_number' => 'RET-003', 'order_number' => 'ORD-003', 'customer' => 'Bob Johnson', 'reason' => 'Not as described', 'status' => 'returned', 'created_at' => 'May 10, 2025'],
            ['id' => 4, 'return_number' => 'RET-004', 'order_number' => 'ORD-004', 'customer' => 'Alice Brown', 'reason' => 'Changed mind', 'status' => 'declined', 'created_at' => 'May 08, 2025'],
        ]);

        $stats = [
            'total_returns' => $returns->count(),
            'requested' => $returns->where('status', 'requested')->count(),
            'approved' => $returns->where('status', 'approved')->count(),
            'returned' => $returns->where('status', 'returned')->count(),
        ];

        return Inertia::render('fulfillment/returns/index', [
            'sampleData' => true,
            'returns' => $returns,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, $returnId)
    {
        $return = collect([
            'id' => $returnId,
            'return_number' => 'RET-001',
            'order_number' => 'ORD-001',
            'customer' => 'John Doe',
            'email' => 'john@example.com',
            'reason' => 'Wrong size',
            'status' => 'requested',
            'items' => [
                ['id' => 1, 'name' => 'Classic T-Shirt', 'sku' => 'TS-001', 'quantity' => 1, 'condition' => 'Unworn'],
            ],
            'created_at' => 'May 15, 2025',
            'comments' => 'Ordered size M but received size S. Would like size L instead.',
        ]);

        return Inertia::render('fulfillment/returns/show', [
            'sampleData' => true,
            'return' => $return,
        ]);
    }

    public function approve(Request $request, $returnId)
    {
        return response()->json(['message' => 'Return approved']);
    }

    public function decline(Request $request, $returnId)
    {
        return response()->json(['message' => 'Return declined']);
    }
}
