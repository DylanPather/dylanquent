<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Shipped</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #000 0%, #2a2a2a 100%); color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">📦 Your Order Has Shipped!</h1>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
            <p style="margin-top: 0;">Hi {{ $customer->name }},</p>

            <p>Great news! Your order is on its way. You can track your shipment using the details below.</p>

            <!-- Order Details -->
            <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #000;">
                <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Order #{{ $order->order_number }}</h2>

                @if ($trackingNumber)
                <div style="margin: 15px 0 0 0;">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 2px;">{{ $trackingNumber }}</p>
                </div>
                @endif

                <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                    Shipped on {{ $order->shipped_at?->format('M d, Y') ?? now()->format('M d, Y') }}
                </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('customer.orders.show', $order->order_number) }}" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                    View Order
                </a>
                @if ($trackingNumber)
                <a href="#" style="display: inline-block; background: #fff; color: #000; border: 2px solid #000; padding: 10px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Track Package
                </a>
                @endif
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 13px;">
                Tracking information will be updated as your package makes its way to you. Typical delivery times are 3-7 business days.
            </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">{{ config('app.name') }}</p>
            <p style="margin: 5px 0 0 0;">Thanks for shopping with us!</p>
        </div>
    </div>
</body>
</html>
