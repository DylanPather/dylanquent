import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, Package, ArrowRight, Printer } from 'lucide-react';
import React from 'react';

interface Props {
    order: any;
}

export default function Success({ order }: Props) {
    return (
        <StorefrontLayout title="Acquisition Complete">
            <div className="max-w-3xl mx-auto px-6 lg:px-10 py-40 border border-border rounded-[4rem] text-center bg-zinc-50/30 dark:bg-zinc-950/30 mt-12 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                    <Check className="size-10" />
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">Identity Verified.</h1>
                <p className="text-xl text-zinc-500 font-light max-w-xl mx-auto mb-12 leading-relaxed">
                    The Acquisition Protocol for <span className="text-foreground font-medium">{order.order_number}</span> has been successfully initialized. Your pieces are being curated for dispatch.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href={route('customer.orders.index')}
                        className="h-14 px-8 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Package className="size-4" />
                        Track Transit
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="h-14 px-8 rounded-2xl border border-border text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                    >
                        <Printer className="size-4" />
                        Print Receipt
                    </button>
                    <Link
                        href={route('shop.index')}
                        className="h-14 px-8 text-xs font-black uppercase tracking-widest flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Return to Archives
                        <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </StorefrontLayout>
    );
}
