import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import React from 'react';
import VariantPreview from '../../components/storefront/variant-preview';
import { Pagination } from '../../components/pagination';

interface Props {
    products: {
        data: any[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ products }: Props) {
    return (
        <StorefrontLayout title="Catalog">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-12 gap-8">
                    <div>
                        <h1 className="text-premium-heading mb-4">Archives</h1>
                        <p className="copy-muted font-light tracking-[0.1em] uppercase text-xs">Explore all released silhouettes.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 copy-muted" />
                            <input
                                type="text"
                                placeholder="SEARCH ARCHIVES..."
                                className="h-12 w-64 rounded-full border border-border bg-zinc-50/50 pl-12 pr-6 text-[12px] font-bold uppercase tracking-[0.1em] outline-none transition-all focus:w-80 focus:bg-white dark:bg-zinc-900/50 dark:focus:bg-zinc-900"
                            />
                        </div>
                        <button className="flex items-center gap-2 h-12 px-6 rounded-full border border-border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <Filter className="size-4" />
                            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Filter</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.data.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                    ))}

                    {products.data.length === 0 && (
                        <div className="col-span-full py-40 text-center">
                            <p className="text-sm font-black uppercase tracking-[0.16em] copy-muted">The archives are currently empty.</p>
                        </div>
                    )}
                </div>

                <Pagination
                    links={products.links}
                    currentPage={products.current_page}
                    lastPage={products.last_page}
                    label="Archive"
                    className="mt-24 border-t border-border pt-12"
                />

            </div>
        </StorefrontLayout>
    );
}

function ProductCard({ product, index }: { product: any; index: number }) {
    const previews: string[] = product.preview_urls?.length
        ? product.preview_urls
        : [product.thumbnail_url].filter(Boolean);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group"
        >
            <Link href={route('shop.show', product.slug)}>
                {/* No grayscale filter here any more: the card now has to carry
                    the colourways, and draining them defeats the point. */}
                <VariantPreview
                    images={previews}
                    alt={product.name}
                    delay={index * 400}
                    className="aspect-[3/4] rounded-3xl border border-border bg-zinc-100 transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] dark:bg-zinc-900"
                >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    <div className="absolute left-6 top-6">
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-black shadow-xl backdrop-blur-md">
                            {product.categories?.[0] ?? 'Archive'}
                        </span>
                    </div>
                </VariantPreview>
                <div className="mt-8 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-black uppercase leading-none tracking-tighter transition-transform group-hover:translate-x-2">
                            {product.name}
                        </h3>
                        <span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                            R{(product.price_cents / 100).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${product.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] copy-muted">
                            {product.is_available ? 'In stock' : 'Sold out'}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
