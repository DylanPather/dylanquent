<?php

use App\Models\Customer;
use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\PaymentGateway\PaymentGatewayInterface;
use App\Services\PaymentGateway\PaymentProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

/**
 * A pending order for `quantity` units, stocked across the given warehouses.
 *
 * @param  array<string, int>  $stockByWarehouse  code => quantity on hand
 * @return array{0: User, 1: Order, 2: ProductVariant}
 */
function stockedOrder(int $quantity, array $stockByWarehouse = ['JHB-01' => 10]): array
{
    $user = User::factory()->create();
    $customer = Customer::create([
        'user_id' => $user->id, 'name' => 'Thandi', 'email' => 'thandi@example.com',
    ]);

    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE',
        'price_cents' => 4500, 'currency' => 'ZAR', 'is_active' => true,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'M', 'sku' => 'DQ-TEE-M',
        'price_cents' => 4500, 'track_inventory' => true, 'is_active' => true,
    ]);

    foreach ($stockByWarehouse as $code => $onHand) {
        $warehouse = Warehouse::create(['name' => $code, 'code' => $code, 'is_active' => true]);
        InventoryLevel::create([
            'product_variant_id' => $variant->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => $onHand,
        ]);
    }

    $order = Order::create([
        'order_number' => 'ORD-'.fake()->unique()->numerify('#####'),
        'customer_id' => $customer->id, 'status' => 'pending', 'payment_status' => 'pending',
        'payment_gateway' => 'stripe', 'subtotal_cents' => 4500, 'total_cents' => 4500,
        'currency' => 'ZAR', 'placed_at' => now(),
    ]);
    OrderItem::create([
        'order_id' => $order->id, 'product_id' => $product->id,
        'product_variant_id' => $variant->id, 'name' => 'Boxy Tee M',
        'quantity' => $quantity, 'unit_price_cents' => 4500,
        'total_cents' => 4500 * $quantity,
    ]);

    return [$user, $order, $variant];
}

function stockOnHand(ProductVariant $variant): int
{
    return (int) InventoryLevel::where('product_variant_id', $variant->id)->sum('quantity');
}

function confirmPaymentAs(User $user, Order $order, string $status = 'paid'): void
{
    $gateway = new class($status) implements PaymentGatewayInterface
    {
        public function __construct(private string $status) {}

        public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
        {
            return ['status' => 'success'];
        }

        public function confirm(string $paymentId, ?string $paymentMethodId = null): array
        {
            return ['status' => 'success', 'payment_id' => 'pi_1', 'amount' => 4500, 'currency' => 'ZAR'];
        }

        public function refund(string $paymentId, ?int $amountCents = null): array
        {
            return ['status' => 'success'];
        }

        public function handleWebhook(array $payload): array
        {
            return ['status' => $this->status, 'order_id' => $payload['order_id'] ?? null];
        }

        public function verifyWebhookSignature(string $signature, string $body): bool
        {
            return true;
        }

        public function getName(): string
        {
            return 'Fake Gateway';
        }

        public function isConfigured(): bool
        {
            return true;
        }
    };

    app()->instance(PaymentProcessor::class, new class($gateway) extends PaymentProcessor
    {
        public function __construct(private PaymentGatewayInterface $fake) {}

        public function gateway(string $name): PaymentGatewayInterface
        {
            return $this->fake;
        }
    });
}

it('draws stock exactly once when a payment is confirmed', function () {
    Mail::fake();
    [$user, $order, $variant] = stockedOrder(quantity: 2, stockByWarehouse: ['JHB-01' => 10]);
    confirmPaymentAs($user, $order);

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_1'])
        ->assertOk();

    // The observer and the controller both used to deduct, leaving 6.
    expect(stockOnHand($variant))->toBe(8);
});

it('draws stock when an admin marks the order paid by hand', function () {
    Mail::fake();
    [, $order, $variant] = stockedOrder(quantity: 3);

    $order->update(['status' => 'paid']);

    expect(stockOnHand($variant))->toBe(7);
});

it('does not draw stock again when the gateway replays the webhook', function () {
    Mail::fake();
    [$user, $order, $variant] = stockedOrder(quantity: 2);
    confirmPaymentAs($user, $order);

    foreach (range(1, 3) as $attempt) {
        $this->postJson('/webhooks/payment/stripe', ['order_id' => $order->id])->assertOk();
    }

    expect($order->fresh()->status)->toBe('paid')
        ->and(stockOnHand($variant))->toBe(8);
});

it('drains the fullest warehouse first and spills into the next', function () {
    Mail::fake();
    [, $order, $variant] = stockedOrder(quantity: 7, stockByWarehouse: ['JHB-01' => 5, 'CPT-01' => 4]);

    $order->update(['status' => 'paid']);

    $levels = InventoryLevel::where('product_variant_id', $variant->id)
        ->join('warehouses', 'warehouses.id', '=', 'inventory_levels.warehouse_id')
        ->pluck('inventory_levels.quantity', 'warehouses.code');

    expect($levels['JHB-01'])->toBe(0)   // fullest, drained first
        ->and($levels['CPT-01'])->toBe(2)
        ->and(stockOnHand($variant))->toBe(2);
});

it('records an inventory movement for every draw', function () {
    Mail::fake();
    [, $order, $variant] = stockedOrder(quantity: 7, stockByWarehouse: ['JHB-01' => 5, 'CPT-01' => 4]);

    $order->update(['status' => 'paid']);

    $movements = InventoryMovement::where('reference_type', Order::class)
        ->where('reference_id', $order->id)
        ->get();

    expect($movements)->toHaveCount(2)
        ->and($movements->pluck('type')->unique()->all())->toBe(['sale'])
        ->and((int) $movements->sum('quantity'))->toBe(-7);
});

it('still marks the order paid when stock runs short', function () {
    Mail::fake();
    [, $order, $variant] = stockedOrder(quantity: 5, stockByWarehouse: ['JHB-01' => 2]);

    $order->update(['status' => 'paid']);

    expect($order->fresh()->status)->toBe('paid')
        ->and(stockOnHand($variant))->toBe(0);
});
