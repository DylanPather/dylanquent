import { useState, FormEvent } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StorefrontLayout from '../../layouts/storefront-layout';

interface PaymentData {
    order: {
        id: number;
        order_number: string;
        total_cents: number;
        currency: string;
    };
    gateways: Array<{ id: string; name: string }>;
    defaultGateway: string;
}

export default function Payment() {
    const { order, gateways, defaultGateway } = usePage().props as any as PaymentData;
    const [selectedGateway, setSelectedGateway] = useState(defaultGateway);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGatewaySelect = (gatewayId: string) => {
        setSelectedGateway(gatewayId);
        setError(null);
    };

    const initiatePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('payment.initiate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    gateway: selectedGateway,
                    order_id: order.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to initiate payment');
                setLoading(false);
                return;
            }

            // Handle different gateway responses
            if (selectedGateway === 'paypal' && data.redirect_url) {
                // PayPal redirect
                window.location.href = data.redirect_url;
            } else if (data.client_secret) {
                // Stripe - redirect to Stripe payment page
                router.visit(route('payment.confirm'), {
                    method: 'post',
                    data: {
                        order_id: order.id,
                        payment_id: data.payment_id,
                        client_secret: data.client_secret,
                    },
                });
            } else if (data.redirect_url) {
                // OSOW/Yoco redirect
                window.location.href = data.redirect_url;
            } else {
                setError('Unexpected response from payment gateway');
                setLoading(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment initiation failed');
            setLoading(false);
        }
    };

    const amountFormatted = (order.total_cents / 100).toFixed(2);

    return (
        <StorefrontLayout>
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button */}
                    <Link href={route('checkout.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-8 transition-colors">
                        <ArrowLeft className="size-4" />
                        Back to Checkout
                    </Link>

                    {/* Order Summary Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-xl font-black tracking-tight">Order Summary</h2>
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">#{order.order_number}</span>
                        </div>
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base text-zinc-600 dark:text-zinc-400">Total Amount</span>
                                <span className="text-2xl md:text-3xl font-black">{amountFormatted} {order.currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-black mb-6 tracking-tight">Select Payment Method</h3>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {gateways.map((gateway) => (
                                <button
                                    key={gateway.id}
                                    onClick={() => handleGatewaySelect(gateway.id)}
                                    disabled={loading}
                                    className={`p-4 rounded-xl border-2 transition-all font-semibold tracking-wide ${
                                        selectedGateway === gateway.id
                                            ? 'border-foreground bg-foreground/5 dark:bg-foreground/10'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {selectedGateway === gateway.id && (
                                            <div className="w-2 h-2 bg-foreground rounded-full" />
                                        )}
                                        {gateway.name}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={initiatePayment}
                            disabled={loading}
                            className="w-full h-14 md:h-16 bg-foreground text-background rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ${amountFormatted} ${order.currency}`
                            )}
                        </button>

                        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4">
                            Your payment information is securely processed by our payment partners.
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secure &amp; encrypted payment</span>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
