import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    cart: Record<string, any>;
    customer: any;
}

export default function Index({ cart, customer }: Props) {
    const cartItems = Object.values(cart);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price_cents * item.quantity), 0);

    const { data, setData, post, processing, errors } = useForm({
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

                        {/* Payment Draft */}
                        <section>
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
                                <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black italic">2</div>
                                <h2 className="text-2xl font-black uppercase tracking-[0.1em]">Verification & Payment</h2>
                            </div>
                            <div className="p-10 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950 border border-border flex flex-col items-center text-center gap-6">
                                <CreditCard className="size-10 text-zinc-300" />
                                <p className="copy-muted font-light max-w-sm">
                                    Payment processing is handled via secure identity verification. By continuing, you agree to the Dylanquent Acquisition Protocol.
                                </p>
                            </div>
                        </section>
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
                                    <span>R{(subtotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-[0.1em] copy-muted">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500">Complimentary</span>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-between items-end">
                                    <span className="text-sm font-black uppercase tracking-[0.1em]">Total</span>
                                    <span className="text-3xl font-light">R{(subtotal / 100).toFixed(2)}</span>
                                </div>
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
