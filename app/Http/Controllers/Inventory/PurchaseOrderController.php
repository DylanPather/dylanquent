<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\ProductVariant;
use App\Models\Warehouse;
use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(): Response
    {
        $pos = PurchaseOrder::query()->latest()->paginate(15)->through(fn (PurchaseOrder $po) => [
            'id' => $po->id,
            'po_number' => $po->po_number,
            'supplier_name' => $po->supplier_name,
            'status' => $po->status,
            'total_cents' => $po->total_cents,
            'currency' => $po->currency,
            'expected_at' => $po->expected_at?->toDateString(),
        ]);

        return Inertia::render('inventory/pos/index', [
            'purchaseOrders' => $pos,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/pos/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'po_number' => ['required','string','max:50','unique:purchase_orders,po_number'],
            'supplier_name' => ['required','string','max:255'],
            'currency' => ['required','string','size:3'],
            'expected_at' => ['nullable','date'],
            'notes' => ['nullable','string'],
        ]);
        $po = PurchaseOrder::create([
            'po_number' => strtoupper($data['po_number']),
            'supplier_name' => $data['supplier_name'],
            'currency' => strtoupper($data['currency']),
            'expected_at' => $data['expected_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
        return redirect()->route('inventory.pos.edit', $po)->with('status', 'PO created');
    }

    public function edit(PurchaseOrder $purchase_order): Response
    {
        $purchase_order->load('items');

        $variants = ProductVariant::with('product:id,name')
            ->orderBy('sku')
            ->limit(100)
            ->get(['id','product_id','name','sku']);
        $warehouses = Warehouse::orderBy('name')->get(['id','name','code']);

        return Inertia::render('inventory/pos/edit', [
            'po' => [
                'id' => $purchase_order->id,
                'po_number' => $purchase_order->po_number,
                'supplier_name' => $purchase_order->supplier_name,
                'status' => $purchase_order->status,
                'currency' => $purchase_order->currency,
                'expected_at' => $purchase_order->expected_at?->toDateString(),
                'notes' => $purchase_order->notes,
            ],
            'items' => $purchase_order->items->map(function (PurchaseOrderItem $it) {
                return [
                    'id' => $it->id,
                    'product_variant_id' => $it->product_variant_id,
                    'quantity' => $it->quantity,
                    'unit_cost' => $it->unit_cost_cents / 100,
                    'total' => $it->total_cents / 100,
                    'sku' => optional($it->variant)->sku,
                    'name' => optional($it->variant)->name,
                ];
            }),
            'variants' => $variants->map(fn ($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'label' => trim(($v->product?->name ? $v->product->name.' – ' : '').($v->name ?? '').' '.$v->sku),
            ]),
            'warehouses' => $warehouses,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchase_order)
    {
        $data = $request->validate([
            'po_number' => ['required','string','max:50','unique:purchase_orders,po_number,'.$purchase_order->id],
            'supplier_name' => ['required','string','max:255'],
            'status' => ['required','in:draft,sent,received,partially_received,cancelled'],
            'currency' => ['required','string','size:3'],
            'expected_at' => ['nullable','date'],
            'notes' => ['nullable','string'],
        ]);
        $purchase_order->update([
            'po_number' => strtoupper($data['po_number']),
            'supplier_name' => $data['supplier_name'],
            'status' => $data['status'],
            'currency' => strtoupper($data['currency']),
            'expected_at' => $data['expected_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
        return back()->with('status', 'PO updated');
    }

    public function destroy(PurchaseOrder $purchase_order)
    {
        $purchase_order->delete();
        return redirect()->route('inventory.pos.index')->with('status', 'PO deleted');
    }

    public function addItem(Request $request, PurchaseOrder $purchase_order)
    {
        $data = $request->validate([
            'product_variant_id' => ['required','exists:product_variants,id'],
            'quantity' => ['required','integer','min:1'],
            'unit_cost' => ['required','numeric','min:0'],
        ]);
        $unit = (int) round($data['unit_cost'] * 100);
        $total = $unit * (int) $data['quantity'];
        $item = $purchase_order->items()->create([
            'product_variant_id' => $data['product_variant_id'],
            'quantity' => (int) $data['quantity'],
            'unit_cost_cents' => $unit,
            'total_cents' => $total,
        ]);
        $this->recalculateTotals($purchase_order);
        return back()->with('status', 'Item added');
    }

    public function updateItem(Request $request, PurchaseOrder $purchase_order, PurchaseOrderItem $item)
    {
        $this->authorizeItem($purchase_order, $item);
        $data = $request->validate([
            'product_variant_id' => ['required','exists:product_variants,id'],
            'quantity' => ['required','integer','min:1'],
            'unit_cost' => ['required','numeric','min:0'],
        ]);
        $unit = (int) round($data['unit_cost'] * 100);
        $total = $unit * (int) $data['quantity'];
        $item->update([
            'product_variant_id' => $data['product_variant_id'],
            'quantity' => (int) $data['quantity'],
            'unit_cost_cents' => $unit,
            'total_cents' => $total,
        ]);
        $this->recalculateTotals($purchase_order);
        return back()->with('status', 'Item updated');
    }

    public function destroyItem(PurchaseOrder $purchase_order, PurchaseOrderItem $item)
    {
        $this->authorizeItem($purchase_order, $item);
        $item->delete();
        $this->recalculateTotals($purchase_order);
        return back()->with('status', 'Item deleted');
    }

    public function receive(Request $request, PurchaseOrder $purchase_order)
    {
        $data = $request->validate([
            'warehouse_id' => ['required','exists:warehouses,id'],
        ]);

        $warehouseId = (int) $data['warehouse_id'];
        $items = $purchase_order->items()->with('variant')->get();

        foreach ($items as $item) {
            if (!$item->variant) { continue; }
            $this->adjustInventory($item->variant->id, $warehouseId, (int) $item->quantity, $purchase_order);
        }

        $purchase_order->update(['status' => 'received']);
        return back()->with('status', 'Stock received');
    }

    protected function recalculateTotals(PurchaseOrder $po): void
    {
        $sum = (int) $po->items()->sum('total_cents');
        $po->update(['subtotal_cents' => $sum, 'total_cents' => $sum]);
    }

    protected function authorizeItem(PurchaseOrder $po, PurchaseOrderItem $item): void
    {
        if ($item->purchase_order_id !== $po->id) {
            abort(404);
        }
    }

    protected function adjustInventory(int $variantId, int $warehouseId, int $qty, PurchaseOrder $po): void
    {
        // Update/increment inventory level
        $level = InventoryLevel::firstOrCreate(
            ['product_variant_id' => $variantId, 'warehouse_id' => $warehouseId],
            ['quantity' => 0]
        );
        $level->increment('quantity', $qty);

        // Update variant cached stock
        ProductVariant::where('id', $variantId)->increment('stock_quantity', $qty);

        // Record movement
        InventoryMovement::create([
            'product_variant_id' => $variantId,
            'warehouse_id' => $warehouseId,
            'type' => 'purchase',
            'quantity' => $qty,
            'reference_type' => PurchaseOrder::class,
            'reference_id' => $po->id,
            'performed_by' => optional(request()->user())->id,
            'note' => 'PO receive',
            'occurred_at' => now(),
        ]);
    }
}
