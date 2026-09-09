import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import React from 'react';

interface Totals {
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    tax_inclusive: boolean;
    tax_label: string;
    free_shipping_remaining_cents: number | null;
}

interface Props {
    cart: Record<string, any>;
    totals: Totals;
}

const money = (cents: number) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ cart, totals }: Props) {
    const cartItems = Object.values(cart);
    // Totals come from the server so the figure shown is the figure charged.
    const subtotal = totals?.subtotal_cents ?? 0;

    return (
        <StorefrontLayout title="Your Archive">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-12">
                <h1 className="text-premium-heading mb-12 md:mb-16">Your Archive</h1>

                {cartItems.length > 0 ? (
                    <div className="grid lg:grid-cols-3 gap-10 md:gap-16 lg:gap-20">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-6 md:space-y-10">
                            {cartItems.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[2.5rem] lg:sticky lg:top-32">
                                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.16em] mb-6 md:mb-10 border-b border-border pb-4 md:pb-6">Archive Summary</h3>
                                <div className="space-y-4 md:space-y-6 mb-6 md:mb-10">
                                    <div className="flex justify-between text-[12px] md:text-xs font-bold uppercase tracking-[0.1em] copy-muted">
                                        <span>Subtotal</span>
                                        <span>{money(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-[12px] md:text-xs font-bold uppercase tracking-[0.1em] copy-muted">
                                        <span>Delivery</span>
                                        <span>{totals.shipping_cents === 0 ? 'Free' : money(totals.shipping_cents)}</span>
                                    </div>

                                    {totals.free_shipping_remaining_cents !== null && (
                                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-500">
                                            {money(totals.free_shipping_remaining_cents)} more for free delivery
                                        </p>
                                    )}

                                    <div className="pt-4 md:pt-6 border-t border-border flex justify-between items-end">
                                        <span className="text-sm font-black uppercase tracking-[0.1em]">Total</span>
                                        <span className="text-2xl md:text-3xl font-light">{money(totals.total_cents)}</span>
                                    </div>

                                    {totals.tax_cents > 0 && (
                                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                                            {totals.tax_inclusive
                                                ? `Includes ${totals.tax_label} ${money(totals.tax_cents)}`
                                                : `${totals.tax_label} ${money(totals.tax_cents)}`}
                                        </p>
                                    )}
                                </div>
                                <Link
                                    href={route('checkout.index')}
                                    className="w-full h-14 md:h-16 btn-premium flex items-center justify-center gap-3 md:gap-4 group text-xs md:text-sm"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                                </Link>
                                <p className="mt-4 md:mt-6 text-[11px] md:text-[12px] text-center uppercase font-bold tracking-[0.1em] copy-muted">
                                    Secure verification required for high-fidelity pieces.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 md:py-40 flex flex-col items-center justify-center text-center">
                        <div className="size-20 md:size-24 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-border flex items-center justify-center mb-6 md:mb-10">
                            <ShoppingBag className="size-7 md:size-8 text-zinc-300" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-3 md:mb-4 copy-muted">Your Archive is Empty</h2>
                        <Link href={route('shop.index')} className="text-[12px] md:text-xs font-bold uppercase tracking-[0.1em] border-b-2 border-foreground pb-1 hover:pb-2 transition-all">
                            Browse Collection
                        </Link>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}

function CartItem({ item }: { item: any }) {
    const { post, processing, setData } = useForm({
        id: item.id,
        quantity: item.quantity,
    });

    const updateQuantity = (newQty: number) => {
        if (newQty < 1) return;
        setData('quantity', newQty);
        post(route('cart.update'), {
            preserveScroll: true,
        });
    };

    const removeItem = () => {
        post(route('cart.remove'), {
            preserveScroll: true,
        });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-10 group"
        >
            <div className="size-40 rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-border shrink-0">
                <img src={item.thumbnail_url || '/images/placeholder.png'} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">{item.name}</h3>
                <p className="text-sm font-light copy-muted">Acquisition ID: {item.id}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="h-12 flex items-center border border-border rounded-xl px-1">
                        <button
                            disabled={processing}
                            onClick={() => updateQuantity(item.quantity - 1)}
                            className="size-10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                        >
                            <Minus className="size-3" />
                        </button>
                        <span className="w-10 text-center text-xs font-black">{item.quantity}</span>
                        <button
                            disabled={processing}
                            onClick={() => updateQuantity(item.quantity + 1)}
                            className="size-10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                        >
                            <Plus className="size-3" />
                        </button>
                    </div>
                    <button
                        onClick={removeItem}
                        className="p-3 text-zinc-300 hover:text-rose-500 transition-colors"
                    >
                        <Trash2 className="size-5" />
                    </button>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-light">R{((item.price_cents * item.quantity) / 100).toFixed(2)}</p>
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted mt-1">R{(item.price_cents / 100).toFixed(2)} / UNIT</p>
            </div>
        </motion.div>
    );
}
