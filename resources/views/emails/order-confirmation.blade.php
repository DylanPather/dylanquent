<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed</h1>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
            <p style="margin-top: 0;">Hi {{ $customer->name }},</p>

            <p>Thank you for your order! We've received your payment and are preparing your items for shipment.</p>

            <!-- Order Details -->
            <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Order #{{ $order->order_number }}</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">Placed on {{ $order->placed_at->format('M d, Y \a\t g:i A') }}</p>
            </div>

            <!-- Items -->
            <h3 style="margin: 20px 0 10px 0; font-size: 16px; font-weight: 600;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <th style="text-align: left; padding: 10px 0; font-weight: 600; font-size: 14px;">Item</th>
                    <th style="text-align: center; padding: 10px 0; font-weight: 600; font-size: 14px;">Qty</th>
                    <th style="text-align: right; padding: 10px 0; font-weight: 600; font-size: 14px;">Price</th>
                </tr>
                @foreach ($items as $item)
                <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 12px 0; font-size: 14px;">{{ $item->name }}</td>
                    <td style="text-align: center; padding: 12px 0; font-size: 14px;">{{ $item->quantity }}</td>
                    <td style="text-align: right; padding: 12px 0; font-size: 14px;">{{ $currency }} {{ number_format($item->unit_price_cents / 100, 2) }}</td>
                </tr>
                @endforeach
            </table>

            <!-- Total -->
            <div style="text-align: right; padding-top: 15px; border-top: 2px solid #000;">
                <p style="margin: 10px 0; font-size: 16px; font-weight: 600;">
                    Total: <strong>{{ $currency }} {{ $total }}</strong>
                </p>
            </div>

            <!-- Shipping Address -->
            <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Shipping Address</h3>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    @if ($order->shipping_address)
                        {{ $order->shipping_address['name'] ?? '' }}<br>
                        {{ $order->shipping_address['street'] ?? '' }}<br>
                        {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['zip'] ?? '' }}<br>
                        {{ $order->shipping_address['country'] ?? '' }}
                    @endif
                </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('customer.orders.show', $order->order_number) }}" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Track Your Order
                </a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 13px;">
                If you have any questions, please reply to this email or visit our support page.
            </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">{{ config('app.name') }}</p>
            <p style="margin: 5px 0 0 0;">Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
