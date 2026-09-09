import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ShippingRate {
    method: string;
    label: string;
    description: string;
    cents: number;
    free: boolean;
}

interface Totals {
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    tax_inclusive: boolean;
    tax_label: string;
}

interface Props {
    cart: Record<string, any>;
    customer: any;
    totals: Totals;
    shippingRates: ShippingRate[];
    shippingTotals: Record<string, Totals>;
}

const money = (cents: number) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ cart, customer, totals, shippingRates, shippingTotals }: Props) {
    const cartItems = Object.values(cart);
    const subtotal = totals?.subtotal_cents ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        shipping_method: '',
        shipping_address: customer?.shipping_address || {
            address: '',
            city: '',
            postal_code: '',
            country: 'South Africa',
        },
        billing_address: customer?.billing_address || {
            address: '',
            city: '',
            postal_code: '',
            country: 'South Africa',
        },
    });

    const [quoting, setQuoting] = useState(false);
    const postcode = data.shipping_address.postal_code;
    const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Re-quote delivery whenever the postal code settles. Couriers price on
    // destination, so there is nothing to ask them until this is filled in.
    useEffect(() => {
        clearTimeout(debounce.current);

        if (!postcode || postcode.length < 4) return;

        debounce.current = setTimeout(() => {
            router.reload({
                only: ['shippingRates', 'shippingTotals'],
                data: { postal_code: postcode },
                onStart: () => setQuoting(true),
                onFinish: () => setQuoting(false),
            });
        }, 500);

        return () => clearTimeout(debounce.current);
    }, [postcode]);

    // Default to the cheapest option as soon as quotes arrive.
    useEffect(() => {
        if (shippingRates?.length && !shippingRates.some((r) => r.method === data.shipping_method)) {
            setData('shipping_method', shippingRates[0].method);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingRates]);

    // Server-computed totals for the chosen option; falls back before quoting.
    const active: Totals = shippingTotals?.[data.shipping_method] ?? totals;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <StorefrontLayout title="Checkout">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                <h1 className="text-premium-heading mb-16">Acquisition</h1>

                <form onSubmit={submit} className="grid lg:grid-cols-3 gap-20">
                    <div className="lg:col-span-2 space-y-16">
                        {/* Shipping */}
                        <section>
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
                                <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black italic">1</div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Shipping Protocol</h2>
                            </div>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] uppercase font-bold tracking-[0.1em] copy-muted">Street Address</label>
                                    <input
                                        type="text"
                                        value={data.shipping_address.address}
                                        onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })}
                                        className="w-full h-14 rounded-2xl border border-border bg-zinc-50/50 px-6 text-sm outline-none focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-[12px] uppercase font-bold tracking-[0.1em] copy-muted">City</label>
                                        <input
                                            type="text"
                                            value={data.shipping_address.city}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, city: e.target.value })}
                                            className="w-full h-14 rounded-2xl border border-border bg-zinc-50/50 px-6 text-sm outline-none focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] uppercase font-bold tracking-[0.1em] copy-muted">Postal Code</label>
                                        <input
                                            type="text"
                                            value={data.shipping_address.postal_code}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, postal_code: e.target.value })}
                                            className="w-full h-14 rounded-2xl border border-border bg-zinc-50/50 px-6 text-sm outline-none focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
                                <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black italic">2</div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Delivery</h2>
                            </div>

                            {!postcode || postcode.length < 4 ? (
                                <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                                    Enter your postal code above to see delivery options and pricing.
                                </p>
                            ) : quoting ? (
                                <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                                    Getting courier rates…
                                </p>
                            ) : shippingRates?.length ? (
                                <div className="space-y-3">
                                    {shippingRates.map((rate) => (
                                        <label
                                            key={rate.method}
                                            className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors ${
                                                data.shipping_method === rate.method ? 'border-foreground' : 'border-border hover:border-foreground/40'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="shipping_method"
                                                value={rate.method}
                                                checked={data.shipping_method === rate.method}
                                                onChange={() => setData('shipping_method', rate.method)}
                                                className="mt-1"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex justify-between gap-3 text-[13px] font-black uppercase tracking-[0.1em]">
                                                    <span>{rate.label}</span>
                                                    <span>{rate.free ? 'Free' : money(rate.cents)}</span>
                                                </span>
                                                {rate.description && (
                                                    <span className="mt-1 block text-[12px] font-light normal-case tracking-normal copy-muted">
                                                        {rate.description}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-amber-600">
                                    No delivery options found for that postal code. Please check it and try again.
                                </p>
                            )}

                            {errors.shipping_method && (
                                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-red-600">{errors.shipping_method}</p>
                            )}
                        </section>

                        {/* Payment Draft */}
                        <section>
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
                                <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black italic">3</div>
                                <h2 className="text-2xl font-black uppercase tracking-[0.1em]">Verification & Payment</h2>
                            </div>
                            <div className="p-10 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950 border border-border flex flex-col items-center text-center gap-6">
                                <CreditCard className="size-10 text-zinc-300" />
                                <p className="copy-muted font-light max-w-sm">
                                    Payment processing is handled via secure identity verification. By continuing, you agree to the Dylanquent Acquisition Protocol.
                                </p>
                            </div>
                        </section>

                        {/* Delivery */}
                    </div>

                    {/* Order Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-10 rounded-[2.5rem] sticky top-32 space-y-10">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.16em] mb-8 border-b border-border pb-4">Manifest</h3>
                                <div className="space-y-6 max-h-60 overflow-y-auto pr-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-[12px] font-bold uppercase tracking-[0.1em]">
                                            <span className="truncate max-w-[140px]">{item.name} x{item.quantity}</span>
                                            <span className="copy-muted">R{((item.price_cents * item.quantity) / 100).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border space-y-4">
                                <div className="flex justify-between text-xs font-black uppercase tracking-[0.1em] copy-muted">
                                    <span>Subtotal</span>
                                    <span>{money(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-[0.1em] copy-muted">
                                    <span>Delivery</span>
                                    <span>
                                        {!postcode || postcode.length < 4
                                            ? 'Enter postal code'
                                            : quoting
                                              ? 'Quoting…'
                                              : active.shipping_cents === 0
                                                ? 'Free'
                                                : money(active.shipping_cents)}
                                    </span>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-between items-end">
                                    <span className="text-sm font-black uppercase tracking-[0.1em]">Total</span>
                                    <span className="text-3xl font-light">{money(active.total_cents)}</span>
                                </div>
                                {active.tax_cents > 0 && (
                                    <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                                        {active.tax_inclusive
                                            ? `Includes ${active.tax_label} ${money(active.tax_cents)}`
                                            : `${active.tax_label} ${money(active.tax_cents)}`}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-16 btn-premium flex items-center justify-center gap-4 group"
                            >
                                {processing ? 'Verifying...' : 'Finalize Acquisition'}
                                <ShieldCheck className="size-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
}
