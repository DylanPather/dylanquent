<?php

namespace App\Http\Controllers\Sales;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RefundController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::where('payment_status', 'refunded')->orWhere('status', 'refunded');

        // Search
        if ($request->has('search') && $request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($cq) use ($search) {
                    $cq->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search);
                })->orWhere('order_number', 'like', $search);
            });
        }

        // Filter by reason
        if ($request->has('reason') && $request->reason) {
            $query->where('refund_reason', $request->reason);
        }

        // Filter by status
        if ($request->has('refund_status') && $request->refund_status) {
            $query->where('refund_status', $request->refund_status);
        }

        // Sorting
        $sort = $request->get('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $query->orderBy($sortField, $direction);

        $refunds = $query->with('customer')
            ->paginate(15)
            ->through(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? 'Guest',
                    'customer_email' => $order->customer?->email,
                    'amount' => $order->total_cents / 100,
                    'refund_amount' => $order->refund_amount_cents ? $order->refund_amount_cents / 100 : $order->total_cents / 100,
                    'reason' => $order->refund_reason ?? 'No reason provided',
                    'status' => $order->refund_status ?? 'pending',
                    'created_at' => $order->created_at->format('M d, Y'),
                    'refunded_at' => $order->refunded_at?->format('M d, Y'),
                ];
            });

        // Stats
        $totalRefunds = Order::whereIn('payment_status', ['refunded'])->orWhere('status', 'refunded')->count();
        $totalRefundAmount = Order::whereIn('payment_status', ['refunded'])->orWhere('status', 'refunded')->sum('refund_amount_cents') / 100;
        $pendingRefunds = Order::where('refund_status', 'pending')->count();

        return Inertia::render('sales/refunds/index', [
            'refunds' => $refunds,
            'stats' => [
                'total_refunds' => $totalRefunds,
                'total_refund_amount' => $totalRefundAmount,
                'pending_refunds' => $pendingRefunds,
                'avg_refund' => $totalRefunds > 0 ? $totalRefundAmount / $totalRefunds : 0,
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'reason' => $request->get('reason', ''),
                'refund_status' => $request->get('refund_status', ''),
                'sort' => $request->get('sort', '-created_at'),
            ],
        ]);
    }

    public function processRefund(Order $order, Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'refund_amount_cents' => (int)($validated['amount'] * 100),
            'refund_reason' => $validated['reason'],
            'refund_notes' => $validated['notes'],
            'refund_status' => 'completed',
            'refunded_at' => now(),
            'payment_status' => 'refunded',
        ]);

        return back()->with('success', 'Refund processed successfully');
    }
}
