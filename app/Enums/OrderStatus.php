<?php

namespace App\Enums;

/**
 * The order lifecycle vocabulary — the single source of truth for orders.status.
 *
 * The column, the admin filter list, the admin status validation and the
 * OrderObserver all used to carry their own hand-written list, and the lists
 * disagreed: the controller accepted 'processing' and 'shipped', which the
 * column rejected outright, while the observer watched for 'payment_failed',
 * which nothing could ever write. Anything that needs to know what an order
 * status can be reads it from here, and the migration that constrains the
 * column is kept in step by OrderStatusTest.
 */
enum OrderStatus: string
{
    /** Placed, not yet paid for. */
    case Pending = 'pending';

    /** The gateway declined, or captured the wrong amount. Terminal until retried. */
    case PaymentFailed = 'payment_failed';

    /** Paid for and waiting to be picked. */
    case Paid = 'paid';

    /** Being picked and packed. */
    case Processing = 'processing';

    /** Handed to the courier. Also covers what the UI calls "shipped". */
    case Fulfilled = 'fulfilled';

    case Cancelled = 'cancelled';

    case Refunded = 'refunded';

    case PartiallyRefunded = 'partially_refunded';

    /**
     * Every status, in lifecycle order.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Statuses an order can move to 'paid' from, i.e. it has not been paid for yet. */
    public function isAwaitingPayment(): bool
    {
        return $this === self::Pending || $this === self::PaymentFailed;
    }
}
