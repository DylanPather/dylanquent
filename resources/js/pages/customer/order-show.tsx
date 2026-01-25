import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Package, ChevronLeft, Printer, Truck, Calendar, MapPin } from 'lucide-react';
import React from 'react';

interface Props {
    order: any;
}

export default function OrderShow({ order }: Props) {
    return (
        <StorefrontLayout title={`Order ${order.order_number}`}>
            <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
                {/* Back Nav */}
                <Link
                    href={route('customer.orders.index')}
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-foreground transition-all mb-12"
                >
                    <ChevronLeft className="size-4" />
                    Archive Directory
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 mb-16 gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">{order.order_number}</h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-3 text-zinc-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{new Date(order.placed_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="h-14 px-8 rounded-2xl border border-border flex items-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                    >
                        <Printer className="size-4" />
                        Print Manifest
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-20">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-12">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-10">
                                <div className="size-32 rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-border shrink-0">
                                    <img src={item.product?.thumbnail_url || '/images/placeholder.png'} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{item.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Qty: {item.quantity} &mdash; SKU: {item.sku || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-light">R{(item.total_cents / 100).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Details Sidebar */}
                    <div className="lg:col-span-1 space-y-10">
                        {/* Summary */}
                        <div className="glass-panel p-10 rounded-[2.5rem] space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-4 border-b border-border pb-4">Acquisition Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>R{(order.subtotal_cents / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Transit Fee</span>
                                    <span className="text-emerald-500">Gratis</span>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Acquired Total</span>
                                    <span className="text-3xl font-light">R{(order.total_cents / 100).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="glass-panel p-10 rounded-[2.5rem] space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] border-b border-border pb-4 flex items-center gap-3">
                                <Truck className="size-4" />
                                Transit Protocol
                            </h3>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <MapPin className="size-3" /> Destination
                                </p>
                                <p className="text-sm font-medium leading-relaxed">
                                    {order.shipping_address?.address}<br />
                                    {order.shipping_address?.city}, {order.shipping_address?.postal_code}<br />
                                    {order.shipping_address?.country}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
