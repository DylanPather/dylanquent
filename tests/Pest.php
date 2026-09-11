<?php

use App\Services\PaymentGateway\PaymentGatewayInterface;
use App\Services\PaymentGateway\PaymentProcessor;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
 // ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Swap the payment processor for one whose only gateway returns canned results.
 *
 * Every gateway the real PaymentProcessor registers reads its credentials in
 * its constructor, so simply resolving it under test fatals on an unset
 * config. Binding an instance sidesteps that and lets a test say what the
 * gateway replied.
 *
 * @param  array{initiate?: array, confirm?: array, refund?: array, webhook?: array}  $responses
 */
function fakePaymentGateway(array $responses = []): void
{
    $responses = array_merge([
        'initiate' => ['status' => 'success', 'payment_id' => 'pi_1'],
        'confirm' => ['status' => 'success', 'payment_id' => 'pi_1', 'amount' => 4500, 'currency' => 'ZAR'],
        'refund' => ['status' => 'success'],
        'webhook' => ['status' => 'unhandled'],
    ], $responses);

    $gateway = new class($responses) implements PaymentGatewayInterface
    {
        public function __construct(private array $responses) {}

        public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
        {
            return $this->responses['initiate'];
        }

        public function confirm(string $paymentId, ?string $paymentMethodId = null): array
        {
            return $this->responses['confirm'];
        }

        public function refund(string $paymentId, ?int $amountCents = null): array
        {
            return $this->responses['refund'];
        }

        public function handleWebhook(array $payload): array
        {
            // The order id comes off the payload unless the test pinned one.
            return $this->responses['webhook'] + ['order_id' => $payload['order_id'] ?? null];
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

    // Deliberately does not call parent::__construct(): that would build the
    // real gateways, none of which are configured under test.
    app()->instance(PaymentProcessor::class, new class($gateway) extends PaymentProcessor
    {
        public function __construct(private PaymentGatewayInterface $fake) {}

        public function gateway(string $name): PaymentGatewayInterface
        {
            return $this->fake;
        }
    });
}
