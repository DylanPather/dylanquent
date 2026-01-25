import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronRight, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    product: any;
}

export default function Show({ product }: Props) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.thumbnail_url);

    const { post, processing } = useForm({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        quantity: quantity,
    });

    const addToCart = () => {
        post(route('cart.add'), {
            preserveScroll: true,
            onSuccess: () => {
                // Potential toast or cart drawer open logic here
            }
        });
    };

    return (
        <StorefrontLayout title={product.name}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-8 md:py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-8 md:mb-12 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <ChevronRight className="size-3" />
                    <Link href={route('shop.index')} className="hover:text-foreground transition-colors">Archives</Link>
                    <ChevronRight className="size-3" />
                    <span className="text-foreground truncate">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
                    {/* Left: Gallery */}
                    <div className="space-y-4 md:space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-border"
                        >
                            <img
                                src={activeImage || '/images/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale-[0.2]"
                            />
                        </motion.div>

                        {/* Potential thumbnails grid here */}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="border-b border-border pb-6 md:pb-10 mb-6 md:mb-10">
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4 md:mb-6">{product.name}</h1>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <p className="text-2xl md:text-3xl font-light tracking-tight">R{(product.price_cents / 100).toFixed(2)}</p>
                                <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-border">
                                    <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">In Stock</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8 md:mb-12">
                            <p className="text-zinc-500 font-light leading-relaxed text-base md:text-lg max-w-xl">
                                {product.description || 'A silhouette defined by intentional geometry and premium utility. Crafted for the modern digital nomad.'}
                            </p>
                        </div>

                        {/* Variants */}
                        {product.variants?.length > 0 && (
                            <div className="mb-8 md:mb-12 space-y-4 md:space-y-6">
                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Select Silhouette</h4>
                                <div className="flex flex-wrap gap-3 md:gap-4">
                                    {product.variants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl border transition-all flex items-center justify-center gap-3 md:gap-4 ${selectedVariant?.id === variant.id
                                                ? 'bg-foreground text-background border-foreground shadow-xl'
                                                : 'border-border hover:border-zinc-400 bg-transparent'
                                                }`}
                                        >
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{variant.name || 'Standard'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 mb-8 md:mb-12">
                            <div className="h-14 md:h-16 flex items-center border border-border rounded-xl md:rounded-2xl px-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="size-10 md:size-12 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg md:rounded-xl transition-colors"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="w-12 text-center text-sm font-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="size-10 md:size-12 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg md:rounded-xl transition-colors"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={processing}
                                className="flex-1 h-14 md:h-16 btn-premium group text-xs md:text-sm"
                            >
                                <ShoppingBag className="mr-2 md:mr-3 size-4 md:size-5 group-hover:rotate-12 transition-transform" />
                                {processing ? 'Acquiring...' : 'Add to Archive'}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 md:pt-10 border-t border-border">
                            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                                <Truck className="size-4 md:size-5 text-zinc-400" />
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500">Global Shipping</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                                <ShieldCheck className="size-4 md:size-5 text-zinc-400" />
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500">Secure Access</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                                <RefreshCw className="size-4 md:size-5 text-zinc-400" />
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500">14-Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
