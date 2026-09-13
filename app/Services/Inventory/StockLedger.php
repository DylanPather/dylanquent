<?php

namespace App\Services\Inventory;

use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * The single way stock leaves the shelf.
 *
 * Deductions used to live in two places at once — an order observer and the
 * payment controller — so a paid order took its quantities off twice. Every
 * caller now comes through here.
 */
class StockLedger
{
    /**
     * Draw an order's quantities out of inventory, once.
     *
     * Levels are locked for the duration, drained fullest warehouse first, and
     * each warehouse touched gets its own movement row.
     */
    public function sell(Order $order, ?string $note = null): void
    {
        $note ??= "Order #{$order->order_number}";

        DB::transaction(function () use ($order, $note) {
            // Gateways retry, and a confirm can race its own webhook. The
            // movements this wrote last time are the record that it ran.
            if ($this->alreadySold($order)) {
                return;
            }

            $order->loadMissing('items');

            foreach ($order->items as $item) {
                if (! $item->product_variant_id) {
                    continue;
                }

                $this->drain($order, (int) $item->product_variant_id, (int) $item->quantity, $note);
            }
        });
    }

    private function alreadySold(Order $order): bool
    {
        return InventoryMovement::where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->where('type', 'sale')
            ->exists();
    }

    private function drain(Order $order, int $variantId, int $quantity, string $note): void
    {
        $remaining = $quantity;

        $levels = InventoryLevel::where('product_variant_id', $variantId)
            ->where('quantity', '>', 0)
            ->lockForUpdate()
            ->orderByDesc('quantity')
            ->get();

        foreach ($levels as $level) {
            if ($remaining <= 0) {
                break;
            }

            $take = min($remaining, (int) $level->quantity);

            $level->decrement('quantity', $take);

            InventoryMovement::create([
                'product_variant_id' => $variantId,
                'warehouse_id' => $level->warehouse_id,
                'type' => 'sale',
                'quantity' => -$take,
                'reference_type' => Order::class,
                'reference_id' => $order->id,
                'performed_by' => auth()->id(),
                'note' => $note,
                'occurred_at' => now(),
            ]);

            $remaining -= $take;
        }

        if ($remaining > 0) {
            Log::warning('Order paid with insufficient stock on hand', [
                'order_id' => $order->id,
                'variant_id' => $variantId,
                'short_by' => $remaining,
            ]);
        }
    }
}
