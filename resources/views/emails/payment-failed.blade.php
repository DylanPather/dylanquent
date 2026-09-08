<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Failed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: #fff3cd; color: #856404; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; border-left: 4px solid #ffc107;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">⚠️ Payment Could Not Be Processed</h1>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
            <p style="margin-top: 0;">Hi {{ $customer->name }},</p>

            <p>We tried to process your payment, but it was declined. Don't worry—your order is reserved for you, and you can try again using a different payment method.</p>

            <!-- Error Details -->
            <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Order #{{ $order->order_number }}</h2>

                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                    <strong>Amount:</strong> {{ $currency }} {{ $amount }}
                </p>

                <p style="margin: 10px 0; color: #666; font-size: 14px;">
                    <strong>Reason:</strong> {{ $reason }}
                </p>

                <p style="margin: 15px 0 0 0; color: #666; font-size: 13px;">
                    Common reasons include incorrect card details, insufficient funds, or security checks. Please verify your payment information and try again.
                </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $retryUrl }}" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Retry Payment
                </a>
            </div>

            <div style="background: #f0f7ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #0066cc;">
                    <strong>💡 Tip:</strong> Try a different payment method, verify your billing address matches your card, or contact your bank to see if there are any restrictions on your account.
                </p>
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 13px;">
                If you continue to experience issues, please don't hesitate to reach out to our support team. We're here to help!
            </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">{{ config('app.name') }}</p>
            <p style="margin: 5px 0 0 0;">Need help? Reply to this email anytime.</p>
        </div>
    </div>
</body>
</html>
