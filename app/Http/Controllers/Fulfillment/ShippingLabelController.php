<?php

namespace App\Http\Controllers\Fulfillment;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ShipmentLabel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingLabelController extends Controller
{
    public function index(Request $request)
    {
        $query = ShipmentLabel::with('order.customer');

        // Search
        if ($request->has('search') && $request->search) {
            $search = '%'.$request->search.'%';
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('order_number', 'like', $search)
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', $search);
                    });
            })->orWhere('tracking_number', 'like', $search);
        }

        // Filter by carrier
        if ($request->has('carrier') && $request->carrier) {
            $query->where('carrier', $request->carrier);
        }

        // Sorting
        $sort = $request->get('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $query->orderBy($sortField, $direction);

        $labels = $query->paginate(15)
            ->through(function ($label) {
                return [
                    'id' => $label->id,
                    'order_number' => $label->order->order_number,
                    'customer_name' => $label->order->customer?->name ?? 'Guest',
                    'customer_email' => $label->order->customer?->email,
                    'carrier' => $label->carrier,
                    'tracking_number' => $label->tracking_number,
                    'service_type' => $label->service_type,
                    'cost' => $label->cost_cents ? $label->cost_cents / 100 : 0,
                    'weight' => $label->weight_oz,
                    'status' => 'active',
                    'created_at' => $label->created_at->format('M d, Y'),
                    'label_url' => $label->label_url,
                ];
            });

        // Stats
        $totalLabels = ShipmentLabel::count();
        $uniqueOrders = ShipmentLabel::distinct('order_id')->count('order_id');
        $totalCost = ShipmentLabel::sum('cost_cents') / 100;

        return Inertia::render('fulfillment/shipping-labels/index', [
            'labels' => $labels,
            'stats' => [
                'total_labels' => $totalLabels,
                'orders_shipped' => $uniqueOrders,
                'total_cost' => $totalCost,
                'avg_cost' => $totalLabels > 0 ? $totalCost / $totalLabels : 0,
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'carrier' => $request->get('carrier', ''),
                'sort' => $request->get('sort', '-created_at'),
            ],
        ]);
    }

    public function create(Order $order)
    {
        return Inertia::render('fulfillment/shipping-labels/create', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => [
                    'name' => $order->customer?->name,
                    'email' => $order->customer?->email,
                    'phone' => $order->customer?->phone,
                ],
                'shipping_address' => $order->shipping_address,
                'total' => $order->total_cents / 100,
            ],
            'carriers' => ['USPS', 'UPS', 'FedEx', 'DHL'],
            'services' => [
                'USPS' => ['First Class', 'Priority', 'Priority Express'],
                'UPS' => ['Ground', '3 Day Select', '2nd Day Air', 'Next Day Air'],
                'FedEx' => ['Ground', '2 Day', 'Overnight'],
                'DHL' => ['Ground', 'Express'],
            ],
        ]);
    }

    public function store(Order $order, Request $request)
    {
        $validated = $request->validate([
            'carrier' => 'required|in:USPS,UPS,FedEx,DHL',
            'service_type' => 'required|string',
            'weight_oz' => 'required|numeric|min:0.1',
            'tracking_number' => 'required|string|unique:shipment_labels',
            'cost' => 'required|numeric|min:0',
        ]);

        ShipmentLabel::create([
            'order_id' => $order->id,
            'carrier' => $validated['carrier'],
            'service_type' => $validated['service_type'],
            'weight_oz' => $validated['weight_oz'],
            'tracking_number' => $validated['tracking_number'],
            'cost_cents' => (int) ($validated['cost'] * 100),
            'label_url' => '/labels/'.uniqid().'.pdf',
        ]);

        // 'shipped' was never a status this column accepted, so printing a
        // label threw a constraint violation instead of updating the order.
        // Handing the parcel to a courier is what OrderStatus::Fulfilled
        // means, and it is what ShippingService::markAsShipped already set.
        $order->update(['status' => OrderStatus::Fulfilled]);

        return redirect()->route('fulfillment.shipping-labels.index')
            ->with('success', 'Shipping label created and order marked as shipped');
    }
}
