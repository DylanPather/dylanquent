<?php

use App\Models\Customer;
use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\PaymentGateway\PaymentGatewayInterface;
use App\Services\PaymentGateway\PaymentProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

function shopFixture(int $stock = 10, int $priceCents = 4500): array
{
    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE',
        'price_cents' => $priceCents, 'currency' => 'ZAR', 'is_active' => true,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'M', 'sku' => 'DQ-TEE-M',
        'price_cents' => $priceCents, 'track_inventory' => true, 'is_active' => true,
    ]);
    $warehouse = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create([
        'product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id, 'quantity' => $stock,
    ]);

    return [$product, $variant];
}

it('creates orders in the store currency, not USD', function () {
    [$product, $variant] = shopFixture();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'city' => 'Johannesburg', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd', 'city' => 'Johannesburg'],
    ])->assertRedirect();

    expect(Order::first())->currency->toBe('ZAR');
});

it('prices the order from the database, not the cart snapshot', function () {
    [$product, $variant] = shopFixture(10, 4500);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    // Price rises after the item is already sitting in the cart.
    $variant->update(['price_cents' => 9900]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    // Asserts the subtotal: the total also carries shipping.
    expect(Order::first()->subtotal_cents)->toBe(19800);
});

it('refuses checkout when stock ran out after adding to cart', function () {
    [$product, $variant] = shopFixture(5);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 5]);

    InventoryLevel::where('product_variant_id', $variant->id)->update(['quantity' => 1]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ])->assertSessionHasErrors('cart');

    expect(Order::count())->toBe(0);
});

it('rejects confirming an order that belongs to someone else', function () {
    [$product, $variant] = shopFixture();
    $owner = Customer::create(['name' => 'Owner', 'email' => 'owner@example.com']);
    $order = Order::create([
        'order_number' => 'ORD-X', 'customer_id' => $owner->id, 'status' => 'pending',
        'payment_status' => 'pending', 'subtotal_cents' => 4500, 'total_cents' => 4500,
        'currency' => 'ZAR', 'payment_gateway' => 'stripe',
    ]);

    // Previously threw InvalidArgumentException: guard [customer] is not defined.
    $this->actingAs(User::factory()->create())
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_test'])
        ->assertStatus(403);
});

it('writes shipping into the order total', function () {
    config([
        'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]],
        'store.shipping.default_method' => 'door',
        'store.shipping.free_over_cents' => 100000,
    ]);
    [$product, $variant] = shopFixture(10, 4500);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    $order = Order::first();

    expect($order->subtotal_cents)->toBe(9000)
        ->and($order->shipping_total_cents)->toBe(8000)
        ->and($order->tax_total_cents)->toBe(0)      // not VAT registered
        ->and($order->total_cents)->toBe(17000);     // R170
});

it('drops shipping from the order above the threshold', function () {
    config([
        'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]],
        'store.shipping.default_method' => 'door',
        'store.shipping.free_over_cents' => 100000,
    ]);
    [$product, $variant] = shopFixture(50, 50000);   // R500 each
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    $order = Order::first();

    expect($order->subtotal_cents)->toBe(100000)
        ->and($order->shipping_total_cents)->toBe(0)
        ->and($order->total_cents)->toBe(100000);
});

it('carries the chosen delivery method into the order', function () {
    [$product, $variant] = shopFixture(10, 4500);
    $user = User::factory()->create();

    $this->actingAs($user)->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1,
    ]);
    $this->actingAs($user)->post('/cart/shipping-method', ['method' => 'locker']);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '2001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    $order = Order::first();

    expect($order->shipping_total_cents)->toBe(6000)   // locker, not the R110 door rate
        ->and($order->total_cents)->toBe(10500);
});

it('rejects an unknown delivery method', function () {
    $this->actingAs(User::factory()->create())
        ->post('/cart/shipping-method', ['method' => 'teleportation'])
        ->assertSessionHasErrors('method');
});

/*
 * Stock is drawn down exactly once per paid order.
 *
 * Two independent paths used to deduct on the same `pending -> paid`
 * transition: OrderObserver::deductInventory and PaymentController::reduceStock.
 * Paying for two units took four off the shelf.
 */

/** Stand-in gateway so a payment can be confirmed without touching a provider. */
function fakeGateway(int $amountCents, string $currency = 'ZAR', string $webhookStatus = 'paid', ?int $orderId = null): void
{
    $gateway = new class($amountCents, $currency, $webhookStatus, $orderId) implements PaymentGatewayInterface
    {
        public function __construct(
            private int $amountCents,
            private string $currency,
            private string $webhookStatus,
            private ?int $orderId,
        ) {}

        public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
        {
            return ['status' => 'success', 'payment_id' => 'pay_test'];
        }

        public function confirm(string $paymentId, ?string $paymentMethodId = null): array
        {
            return [
                'status' => 'success',
                'payment_id' => $paymentId,
                'amount' => $this->amountCents,
                'currency' => $this->currency,
            ];
        }

        public function refund(string $paymentId, ?int $amountCents = null): array
        {
            return ['status' => 'success'];
        }

        public function handleWebhook(array $payload): array
        {
            return ['status' => $this->webhookStatus, 'order_id' => $this->orderId];
        }

        public function verifyWebhookSignature(string $signature, string $body): bool
        {
            return true;
        }

        public function getName(): string
        {
            return 'Fake';
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

/** Take an order through checkout and leave it pending against a fake gateway. */
function pendingOrder(User $user, ProductVariant $variant, Product $product, int $quantity = 2): Order
{
    // The paid transition sends the customer their confirmation. Unrelated to
    // stock, faked so it stays out of the way.
    Mail::fake();

    $this_ = test();

    $this_->actingAs($user)->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => $quantity,
    ]);

    $this_->actingAs($user)->post('/checkout', [
        // postal_code is what the courier rate lookup quotes against.
        'shipping_address' => ['line1' => '1 Main Rd', 'postal_code' => '8001'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    // Checkout reads `customer` off the acting instance before creating it, and
    // the test reuses that same instance across requests.
    $user->unsetRelation('customer');

    $order = Order::latest('id')->first();
    $order->update(['payment_gateway' => 'stripe', 'payment_id' => 'pay_test']);

    return $order->fresh();
}

it('deducts stock exactly once when a payment is confirmed', function () {
    [$product, $variant] = shopFixture(10);
    $user = User::factory()->create();
    $order = pendingOrder($user, $variant, $product, 2);

    fakeGateway($order->total_cents);

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pay_test'])
        ->assertOk();

    expect(InventoryLevel::where('product_variant_id', $variant->id)->sum('quantity'))->toBe(8);
});

it('deducts stock exactly once when the webhook marks an order paid', function () {
    [$product, $variant] = shopFixture(10);
    $user = User::factory()->create();
    $order = pendingOrder($user, $variant, $product, 2);

    fakeGateway($order->total_cents, 'ZAR', 'paid', $order->id);

    $this->postJson('/webhooks/payment/stripe', ['id' => 'evt_test'])->assertOk();

    expect(InventoryLevel::where('product_variant_id', $variant->id)->sum('quantity'))->toBe(8);
});

it('records one inventory movement per warehouse it draws from', function () {
    [$product, $variant] = shopFixture(3);                      // JHB holds 3
    $cpt = Warehouse::create(['name' => 'CPT', 'code' => 'CPT-01', 'is_active' => true]);
    InventoryLevel::create([
        'product_variant_id' => $variant->id, 'warehouse_id' => $cpt->id, 'quantity' => 7,
    ]);

    $user = User::factory()->create();
    $order = pendingOrder($user, $variant, $product, 9);         // more than either holds

    fakeGateway($order->total_cents);

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pay_test'])
        ->assertOk();

    $movements = InventoryMovement::where('reference_id', $order->id)
        ->where('reference_type', Order::class)
        ->get();

    // Fullest first: CPT gives all 7, JHB covers the remaining 2.
    expect($movements)->toHaveCount(2)
        ->and($movements->sum('quantity'))->toBe(-9)
        ->and($movements->firstWhere('warehouse_id', $cpt->id)->quantity)->toBe(-7)
        ->and(InventoryLevel::where('product_variant_id', $variant->id)->sum('quantity'))->toBe(1)
        ->and($movements->pluck('type')->unique()->all())->toBe(['sale']);
});

it('does not deduct twice when a gateway retries the paid webhook', function () {
    [$product, $variant] = shopFixture(10);
    $user = User::factory()->create();
    $order = pendingOrder($user, $variant, $product, 2);

    fakeGateway($order->total_cents, 'ZAR', 'paid', $order->id);

    $this->postJson('/webhooks/payment/stripe', ['id' => 'evt_test'])->assertOk();
    $this->postJson('/webhooks/payment/stripe', ['id' => 'evt_test'])->assertOk();

    expect(InventoryLevel::where('product_variant_id', $variant->id)->sum('quantity'))->toBe(8);
});
