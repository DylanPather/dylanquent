<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('phone', 'like', $search);
            });
        }

        // Sorting
        $sort = $request->get('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');

        if ($sortField === 'orders') {
            $query->withCount('orders')->orderBy('orders_count', $direction);
        } elseif ($sortField === 'spent') {
            $query->selectRaw('customers.*, COALESCE(SUM(orders.total_cents), 0) as total_spent')
                ->leftJoin('orders', 'customers.id', '=', 'orders.customer_id')
                ->groupBy('customers.id')
                ->orderBy('total_spent', $direction);
        } else {
            $query->orderBy($sortField, $direction);
        }

        $customers = $query
            ->with(['orders' => function ($q) {
                $q->latest()->limit(3);
            }])
            ->paginate(15)
            ->through(function (Customer $customer) {
                $totalOrders = $customer->orders()->count();
                $totalSpent = $customer->orders()->sum('total_cents') / 100;
                $lastOrder = $customer->orders()->latest()->first();

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'total_orders' => $totalOrders,
                    'total_spent' => $totalSpent,
                    'last_order_date' => $lastOrder?->created_at?->format('M d, Y'),
                    'created_at' => $customer->created_at?->format('M d, Y'),
                    'status' => $totalOrders > 5 ? 'vip' : ($totalOrders > 0 ? 'active' : 'inactive'),
                ];
            });

        // Stats
        $totalCustomers = Customer::count();
        // having() without a groupBy is invalid once ->count() wraps the query.
        $activeCustomers = Customer::has('orders')->count();
        $totalSpent = Order::sum('total_cents') / 100;
        $avgOrderValue = $totalCustomers > 0
            ? Order::sum('total_cents') / Order::count() / 100
            : 0;

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'stats' => [
                'total' => $totalCustomers,
                'active' => $activeCustomers,
                'inactive' => $totalCustomers - $activeCustomers,
                'total_spent' => $totalSpent,
                'avg_order_value' => $avgOrderValue,
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'sort' => $request->get('sort', '-created_at'),
            ],
        ]);
    }

    public function show(string $id)
    {
        $customer = Customer::with(['orders' => function ($q) {
            $q->latest();
        }])->findOrFail($id);

        $totalSpent = $customer->orders()->sum('total_cents') / 100;
        $totalOrders = $customer->orders()->count();
        $avgOrderValue = $totalOrders > 0
            ? $customer->orders()->sum('total_cents') / $totalOrders / 100
            : 0;

        return Inertia::render('customers/show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'created_at' => $customer->created_at?->format('M d, Y'),
            ],
            'stats' => [
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'avg_order_value' => $avgOrderValue,
                'last_order' => $customer->orders()->latest()->first()?->created_at?->format('M d, Y'),
            ],
            'orders' => $customer->orders()->map(function ($order) {
                return [
                    'id' => '#' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'date' => $order->created_at?->format('M d, Y'),
                    'total' => $order->total_cents / 100,
                    'status' => $order->payment_status,
                    'items_count' => $order->items_count ?? 0,
                ];
            }),
        ]);
    }
}
