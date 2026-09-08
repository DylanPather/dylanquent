import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Search, Clock } from 'lucide-react';
import React from 'react';

interface Props {
    orders: any[];
}

export default function Orders({ orders }: Props) {
    return (
        <StorefrontLayout title="Order History">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-12 mb-16 gap-8">
                    <div>
                        <h1 className="text-premium-heading mb-4">Archives</h1>
                        <p className="copy-muted font-light tracking-[0.1em] uppercase text-xs">Your personal acquisition history.</p>
                    </div>
                </div>

                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-zinc-400 transition-all"
                            >
                                <div className="flex items-center gap-8 flex-1">
                                    <div className="size-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border flex items-center justify-center">
                                        <Package className="size-6 copy-muted" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter">{order.order_number}</h3>
                                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted mt-1">
                                            {new Date(order.placed_at).toLocaleDateString()} &mdash; {order.items_count} PIECES
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 text-center md:text-left">
                                    <div className="space-y-1">
                                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{order.status}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">Total Value</p>
                                        <p className="text-xl font-light">R{(order.total_cents / 100).toFixed(2)}</p>
                                    </div>
                                </div>

                                <Link
                                    href={route('customer.orders.show', order.order_number)}
                                    className="h-14 px-8 rounded-2xl border border-border hover:bg-foreground hover:text-background transition-all flex items-center gap-4 text-xs font-black uppercase tracking-[0.1em]"
                                >
                                    Inspector
                                    <ChevronRight className="size-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                        <Clock className="size-16 text-zinc-200 mb-10" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter copy-muted">No Acquisitions Found</h2>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
