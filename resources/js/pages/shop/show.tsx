import StorefrontLayout from '../../layouts/storefront-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Check,
    Minus,
    Plus,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Star,
    Truck,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import VariantPreview from '../../components/storefront/variant-preview';

interface Variant {
    id: number;
    name: string;
    sku: string;
    image_url: string | null;
    images: { url: string; angle: string | null }[];
    price_cents: number;
    compare_at_price_cents: number | null;
    attributes: Record<string, string> | null;
    stock: number;
    is_available: boolean;
}

interface Image { id: number; url: string; alt: string; angle?: string | null }
interface Review { id: number; rating: number; comment: string; author: string; created_at: string }
interface Related {
    id: number;
    name: string;
    slug: string;
    price_cents: number;
    thumbnail_url: string | null;
    preview_urls?: string[];
}

interface Option {
    name: string;
    order: number;
}

interface Design extends Option {
    blurb: string | null;
}

const LOW_STOCK_AT = 5;

/**
 * Named colours a swatch can paint directly. Anything else falls back to the
 * name as a CSS colour, which covers "olive", "sand" and friends; a name CSS
 * cannot resolve just renders as the neutral chip.
 */
const SWATCHES: Record<string, string> = {
    Black: '#111111',
    White: '#ffffff',
};

/**
 * A drop varies on up to three axes — print, colour and size — so the flat
 * variant list is split back into them. Products with a single axis (a cap)
 * report no prints and no colours, and keep the plain size picker.
 *
 * Variants arrive in row order, which is insert order, so renaming or
 * reordering an option would otherwise shuffle the pickers. Every axis sorts
 * on the position the drop recorded against the variant.
 */
function useOptionAxes(variants: Variant[]) {
    return useMemo(() => {
        const collect = <T extends Option>(
            key: 'design' | 'colour' | 'size',
            build: (v: Variant, fallbackOrder: number) => T,
        ): T[] => {
            const out: T[] = [];

            for (const v of variants) {
                const name = v.attributes?.[key];
                if (!name || out.some((o) => o.name === name)) continue;
                out.push(build(v, out.length));
            }

            return out.sort((a, b) => a.order - b.order);
        };

        const designs = collect<Design>('design', (v, i) => ({
            name: v.attributes!.design,
            blurb: v.attributes?.design_blurb ?? null,
            order: Number(v.attributes?.design_order ?? i),
        }));

        const colours = collect<Option>('colour', (v, i) => ({
            name: v.attributes!.colour,
            order: Number(v.attributes?.colour_order ?? i),
        }));

        // Sizes run S/M/L/XL — alphabetical would give L/M/S/XL.
        const sizes = collect<Option>('size', (v, i) => ({
            name: v.attributes!.size,
            order: Number(v.attributes?.size_order ?? i),
        }));

        return { designs, colours, sizes: sizes.map((o) => o.name) };
    }, [variants]);
}

const money = (cents: number) =>
    'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Show() {
    const { product, images, variants, reviews, rating, related, errors } = usePage().props as any as {
        product: any;
        images: Image[];
        variants: Variant[];
        reviews: Review[];
        rating: { average: number | null; count: number };
        related: Related[];
        errors: Record<string, string>;
    };

    // Default to the first variant that can actually be bought.
    const firstSellable = variants.find((v) => v.is_available) ?? variants[0] ?? null;
    const [variantId, setVariantId] = useState<number | null>(firstSellable?.id ?? null);
    const [quantity, setQuantity] = useState(1);
    // Tracked by url rather than index: changing colour rebuilds the gallery,
    // and an index into the old list would point at the wrong shot.
    const [activeUrl, setActiveUrl] = useState<string | null>(firstSellable?.image_url ?? null);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const variant = useMemo(() => variants.find((v) => v.id === variantId) ?? null, [variants, variantId]);

    const { designs, colours, sizes } = useOptionAxes(variants);
    const hasDesigns = designs.length > 0;
    const hasColours = colours.length > 1;
    const design = variant?.attributes?.design ?? null;
    const colour = variant?.attributes?.colour ?? null;
    const size = variant?.attributes?.size ?? null;

    const hasVariants = variants.length > 0;
    const price = variant?.price_cents ?? product.price_cents;
    const compareAt = variant?.compare_at_price_cents ?? null;
    const stock = variant?.stock ?? 0;
    const purchasable = hasVariants ? !!variant?.is_available : true;
    const maxQuantity = hasVariants && variant ? Math.max(1, variant.stock) : 99;

    const variantFor = (designName: string | null, colourName: string | null, sizeName: string | null) =>
        variants.find(
            (v) =>
                v.attributes?.design === designName &&
                (colourName === null || v.attributes?.colour === colourName) &&
                v.attributes?.size === sizeName,
        ) ?? null;

    const imageFor = (designName: string, colourName: string | null) =>
        variants.find(
            (v) =>
                v.attributes?.design === designName &&
                (colourName === null || v.attributes?.colour === colourName),
        )?.image_url ?? null;

    /**
     * The gallery is the selected variant's own angles.
     *
     * A print that runs across the back is two photographs, and which pair you
     * are looking at follows the print and colour chosen — the swatches above
     * are how you move between prints, so repeating them here would say the
     * same thing twice. Variants shot once show one image and no strip;
     * products with no variant photography keep what the server sent.
     */
    const gallery: Image[] = useMemo(() => {
        const angles = variant?.images ?? [];

        if (angles.length) {
            return angles.map((shot, i) => ({
                id: i,
                url: shot.url,
                angle: shot.angle,
                alt: [product.name, variant?.attributes?.design, shot.angle].filter(Boolean).join(' — '),
            }));
        }

        if (variant?.image_url) {
            return [{ id: 0, url: variant.image_url, alt: `${product.name} — ${variant.attributes?.design ?? ''}`.trim() }];
        }

        return images;
    }, [variant, images, product.name]);

    const activeIndex = Math.max(
        0,
        gallery.findIndex((img) => img.url === activeUrl),
    );

    /** Which angle is on screen right now, so a change of print can hold it. */
    const activeAngle = gallery[activeIndex]?.angle ?? null;

    // Selecting a different option must not leave a now-impossible quantity behind.
    const selectVariant = (v: Variant) => {
        setVariantId(v.id);
        setQuantity((q) => Math.min(q, Math.max(1, v.stock)));
        setAdded(false);

        // The gallery follows the choice, so the shopper sees what they picked
        // — from the same side they were already looking at. Someone comparing
        // the backs of five prints should not be sent to the front each time.
        const sameAngle = activeAngle ? v.images.find((shot) => shot.angle === activeAngle) : null;

        setActiveUrl(sameAngle?.url ?? v.images[0]?.url ?? v.image_url);
    };

    /**
     * Changing print or colour keeps the size the shopper already chose. Where
     * that size is sold out in the new combination we move to one that is not,
     * rather than landing them on a dead "Sold out" button.
     */
    const pick = (designName: string | null, colourName: string | null) => {
        const group = variants.filter(
            (v) =>
                (designName === null || v.attributes?.design === designName) &&
                (colourName === null || v.attributes?.colour === colourName),
        );

        return (
            group.find((v) => v.attributes?.size === size && v.is_available) ??
            group.find((v) => v.is_available) ??
            group.find((v) => v.attributes?.size === size) ??
            group[0] ??
            null
        );
    };

    const selectDesign = (name: string) => {
        const next = pick(name, colour);
        if (next) selectVariant(next);
    };

    const selectColour = (name: string) => {
        const next = pick(design, name);
        if (next) selectVariant(next);
    };

    const selectSize = (value: string) => {
        const next = variantFor(design, colour, value);
        if (next) selectVariant(next);
    };

    /** Whether anything in this print, or this colour of it, can be bought. */
    const designInStock = (name: string) =>
        variants.some(
            (v) => v.attributes?.design === name && (!colour || v.attributes?.colour === colour) && v.is_available,
        );

    const colourInStock = (name: string) =>
        variants.some(
            (v) => v.attributes?.colour === name && (!design || v.attributes?.design === design) && v.is_available,
        );

    const addToCart = () => {
        if (!purchasable || adding) return;
        setAdding(true);
        // Posted from current state — the old form captured its values at mount,
        // so it always sent the first variant and a quantity of 1.
        router.post(
            route('cart.add'),
            { product_id: product.id, variant_id: variantId, quantity },
            {
                preserveScroll: true,
                onSuccess: () => { setAdded(true); setQuantity(1); },
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <StorefrontLayout title={product.name}>
            <Head title={product.name} />
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:px-10">
                <nav className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] copy-muted md:mb-12 md:text-[12px]">
                    <Link href={route('merch.home')} className="transition-colors hover:text-foreground">Merch</Link>
                    <ChevronRight className="size-3" />
                    <Link href={route('shop.index')} className="transition-colors hover:text-foreground">Shop</Link>
                    <ChevronRight className="size-3" />
                    <span className="truncate text-foreground">{product.name}</span>
                </nav>

                <div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-20">
                    <Gallery
                        images={gallery}
                        active={activeIndex}
                        onSelect={(i) => setActiveUrl(gallery[i]?.url ?? null)}
                        name={product.name}
                    />

                    <div className="flex flex-col">
                        <div className="mb-6 border-b border-border pb-6 md:mb-10 md:pb-10">
                            {product.categories?.length > 0 && (
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] copy-muted md:text-[12px]">
                                    {product.categories.join(' · ')}
                                </p>
                            )}
                            <h1 className="mb-4 text-3xl font-black uppercase leading-none tracking-tighter md:mb-6 md:text-5xl lg:text-6xl">
                                {product.name}
                            </h1>

                            {rating.count > 0 && (
                                <div className="mb-5 flex items-center gap-3">
                                    <Stars value={rating.average ?? 0} />
                                    <a href="#reviews" className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted hover:text-foreground">
                                        {rating.average} · {rating.count} review{rating.count === 1 ? '' : 's'}
                                    </a>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-baseline gap-3">
                                    <p className="text-2xl font-light tracking-tight md:text-3xl">{money(price)}</p>
                                    {compareAt && compareAt > price && (
                                        <p className="text-base font-light line-through copy-muted">{money(compareAt)}</p>
                                    )}
                                </div>
                                <StockBadge hasVariants={hasVariants} variant={variant} stock={stock} />
                            </div>
                        </div>

                        <div className="mb-8 md:mb-10">
                            <p className="max-w-xl text-base font-light leading-relaxed copy-muted md:text-lg">
                                {product.description ||
                                    'A silhouette defined by intentional geometry and premium utility. Built to be worn daily.'}
                            </p>
                        </div>

                        {hasDesigns && (
                            <div className="mb-8 space-y-4 md:mb-10 md:space-y-5">
                                <div className="flex items-baseline justify-between gap-4">
                                    <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted md:text-[13px]">
                                        Select print
                                    </h2>
                                    <span className="truncate text-[11px] font-bold uppercase tracking-[0.1em] md:text-[12px]">
                                        {design}
                                    </span>
                                </div>

                                <div
                                    role="radiogroup"
                                    aria-label="Print"
                                    className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:gap-4"
                                >
                                    {designs.map((d) => {
                                        const selected = d.name === design;
                                        const available = designInStock(d.name);
                                        return (
                                            <button
                                                key={d.name}
                                                onClick={() => selectDesign(d.name)}
                                                role="radio"
                                                aria-checked={selected}
                                                title={available ? d.name : `${d.name} — sold out`}
                                                className={`group space-y-2 rounded-xl border p-1.5 text-left transition-all md:rounded-2xl md:p-2 ${
                                                    selected
                                                        ? 'border-foreground ring-1 ring-foreground'
                                                        : 'border-border hover:border-foreground/50'
                                                }`}
                                            >
                                                <span className="block aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 md:rounded-xl">
                                                    <img
                                                        src={imageFor(d.name, colour) || '/images/placeholder.png'}
                                                        alt=""
                                                        loading="lazy"
                                                        className={`size-full object-cover transition-opacity duration-300 ${available ? '' : 'opacity-40'}`}
                                                    />
                                                </span>
                                                <span
                                                    className={`block px-0.5 pb-0.5 text-[11px] font-bold uppercase leading-tight tracking-[0.08em] md:text-[12px] ${
                                                        selected ? 'text-foreground' : 'copy-muted'
                                                    }`}
                                                >
                                                    {d.name}
                                                    {!available && <span className="block copy-muted">Sold out</span>}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {variant?.attributes?.design_blurb && (
                                    <p className="text-[13px] font-light leading-relaxed copy-muted md:text-sm">
                                        {variant.attributes.design_blurb}
                                    </p>
                                )}
                            </div>
                        )}

                        {hasColours && (
                            <div className="mb-8 space-y-4 md:mb-10 md:space-y-5">
                                <div className="flex items-baseline justify-between gap-4">
                                    <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted md:text-[13px]">
                                        Select colour
                                    </h2>
                                    <span className="truncate text-[11px] font-bold uppercase tracking-[0.1em] md:text-[12px]">
                                        {colour}
                                    </span>
                                </div>

                                <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-3">
                                    {colours.map((c) => {
                                        const selected = c.name === colour;
                                        const available = colourInStock(c.name);
                                        return (
                                            <button
                                                key={c.name}
                                                onClick={() => selectColour(c.name)}
                                                role="radio"
                                                aria-checked={selected}
                                                title={available ? c.name : `${c.name} — sold out`}
                                                className={`flex h-12 items-center gap-2.5 rounded-xl border pl-2.5 pr-5 transition-all md:h-14 md:gap-3 md:pl-3 md:pr-6 ${
                                                    selected
                                                        ? 'border-foreground ring-1 ring-foreground'
                                                        : 'border-border hover:border-foreground'
                                                }`}
                                            >
                                                {/* A ring rather than a border, so white stays visible on white. */}
                                                <span
                                                    aria-hidden
                                                    className={`size-6 rounded-full ring-1 ring-inset ring-black/25 dark:ring-white/30 md:size-7 ${
                                                        available ? '' : 'opacity-40'
                                                    }`}
                                                    style={{ background: SWATCHES[c.name] ?? c.name.toLowerCase() }}
                                                />
                                                <span
                                                    className={`text-[12px] font-bold uppercase tracking-[0.1em] ${
                                                        selected ? 'text-foreground' : 'copy-muted'
                                                    } ${available ? '' : 'line-through opacity-60'}`}
                                                >
                                                    {c.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {hasVariants && (
                            <div className="mb-8 space-y-4 md:mb-10 md:space-y-5">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted md:text-[13px]">
                                        Select size
                                    </h2>
                                    {variant?.sku && (
                                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] copy-muted">
                                            {variant.sku}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(hasDesigns
                                        ? sizes.map((value) => ({ value, v: variantFor(design, colour, value) }))
                                        : variants.map((v) => ({ value: v.name, v }))
                                    ).map(({ value, v }) => {
                                        const selected = !!v && v.id === variantId;
                                        const available = !!v?.is_available;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    if (!available || !v) return;
                                                    hasDesigns ? selectSize(value) : selectVariant(v);
                                                }}
                                                disabled={!available}
                                                aria-pressed={selected}
                                                title={available ? `${v!.stock} in stock` : 'Sold out'}
                                                className={`relative flex h-12 items-center justify-center rounded-xl border px-6 text-[12px] font-bold uppercase tracking-[0.1em] transition-all md:h-14 md:px-8 ${
                                                    !available
                                                        ? 'cursor-not-allowed border-border copy-muted line-through opacity-50'
                                                        : selected
                                                          ? 'border-foreground bg-foreground text-background shadow-xl'
                                                          : 'border-border hover:border-foreground'
                                                }`}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                                {variant?.is_available && variant.stock <= LOW_STOCK_AT && (
                                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-500">
                                        Only {variant.stock} left in {variant.name}
                                    </p>
                                )}
                            </div>
                        )}

                        {(errors?.quantity || errors?.variant_id) && (
                            <p className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-red-600 dark:text-red-400">
                                {errors.quantity || errors.variant_id}
                            </p>
                        )}

                        <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center md:mb-10">
                            <div className="flex h-14 items-center rounded-xl border border-border px-2 md:h-16">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1 || !purchasable}
                                    aria-label="Decrease quantity"
                                    className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-900 md:size-12"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                    disabled={quantity >= maxQuantity || !purchasable}
                                    aria-label="Increase quantity"
                                    className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-900 md:size-12"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={!purchasable || adding}
                                className="btn-premium group h-14 flex-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 md:h-16 md:text-sm"
                            >
                                {added ? (
                                    <><Check className="mr-3 size-4 md:size-5" /> Added to cart</>
                                ) : (
                                    <>
                                        <ShoppingBag className="mr-3 size-4 transition-transform group-hover:rotate-12 md:size-5" />
                                        {adding ? 'Adding…' : purchasable ? 'Add to cart' : 'Sold out'}
                                    </>
                                )}
                            </button>
                        </div>

                        {added && (
                            <Link
                                href={route('cart.index')}
                                className="mb-8 flex h-12 items-center justify-center rounded-xl border border-border text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:border-foreground md:mb-10"
                            >
                                View cart <ChevronRight className="ml-1 size-4" />
                            </Link>
                        )}

                        <div className="grid grid-cols-3 gap-3 border-t border-border pt-6 md:gap-4 md:pt-8">
                            {[
                                { icon: Truck, label: 'Nationwide shipping' },
                                { icon: ShieldCheck, label: 'Secure checkout' },
                                { icon: RefreshCw, label: '14-day returns' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-2 text-center md:gap-3">
                                    <Icon className="size-4 copy-muted md:size-5" />
                                    <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.1em] copy-muted md:text-[12px]">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {reviews.length > 0 && <Reviews reviews={reviews} rating={rating} />}
                {related.length > 0 && <RelatedProducts related={related} />}
            </div>
        </StorefrontLayout>
    );
}

function Gallery({ images, active, onSelect, name }: { images: Image[]; active: number; onSelect: (i: number) => void; name: string }) {
    const current = images[active] ?? images[0];
    const frame = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

    // Pointer zoom is a mouse affordance: on a touch screen there is no hover
    // to enter it from, and the pinch gesture already does the job.
    const finePointer =
        typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

    const track = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!finePointer) return;

        const box = frame.current?.getBoundingClientRect();
        if (!box) return;

        // Percentages, so transform-origin follows the cursor and the point
        // under it stays put as the image scales.
        setZoom({
            x: ((e.clientX - box.left) / box.width) * 100,
            y: ((e.clientY - box.top) / box.height) * 100,
        });
    };

    return (
        <div className="space-y-4 md:space-y-5">
            <motion.div
                key={current?.url}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                ref={frame}
                onMouseMove={track}
                onMouseLeave={() => setZoom(null)}
                className={`relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-border bg-zinc-100 dark:bg-zinc-900 md:rounded-[2rem] lg:rounded-[2.5rem] ${
                    finePointer ? 'cursor-zoom-in' : ''
                }`}
            >
                <img
                    src={current?.url || '/images/placeholder.png'}
                    alt={current?.alt || name}
                    draggable={false}
                    className="size-full object-cover transition-transform duration-300 ease-out will-change-transform"
                    style={
                        zoom
                            ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                            : { transform: 'scale(1)', transformOrigin: 'center' }
                    }
                />

                {current?.angle && !zoom && (
                    <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-md md:left-6 md:top-6 md:text-[12px]">
                        {current.angle}
                    </span>
                )}
            </motion.div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 md:gap-5 lg:grid-cols-5 lg:gap-4">
                    {images.map((img, i) => (
                        <button
                            key={img.url}
                            onClick={() => onSelect(i)}
                            aria-label={img.angle ? `View ${img.angle.toLowerCase()}` : `View image ${i + 1} of ${images.length}`}
                            aria-pressed={i === active}
                            className={`space-y-1.5 rounded-xl border p-1 transition-all md:rounded-2xl md:p-1.5 ${
                                i === active ? 'border-foreground ring-1 ring-foreground' : 'border-border hover:border-foreground/50'
                            }`}
                        >
                            <span className="block aspect-square overflow-hidden rounded-lg md:rounded-xl">
                                <img src={img.url} alt="" loading="lazy" className="size-full object-cover" />
                            </span>
                            {img.angle && (
                                <span
                                    className={`block pb-0.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] ${
                                        i === active ? 'text-foreground' : 'copy-muted'
                                    }`}
                                >
                                    {img.angle}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function StockBadge({ hasVariants, variant, stock }: { hasVariants: boolean; variant: Variant | null; stock: number }) {
    if (!hasVariants) return null;

    const soldOut = !variant?.is_available;
    const low = !soldOut && stock <= LOW_STOCK_AT;

    const tone = soldOut
        ? 'bg-zinc-100 dark:bg-zinc-900'
        : low
          ? 'bg-amber-500/10'
          : 'bg-emerald-500/10';
    const dot = soldOut ? 'bg-zinc-400' : low ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className={`flex items-center gap-2 rounded-full border border-border px-3 py-1.5 md:px-4 md:py-2 ${tone}`}>
            <div className={`size-2 rounded-full ${dot}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] md:text-[12px]">
                {soldOut ? 'Sold out' : low ? `Only ${stock} left` : 'In stock'}
            </span>
        </div>
    );
}

function Stars({ value, size = 'size-4' }: { value: number; size?: string }) {
    return (
        <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`${size} ${n <= Math.round(value) ? 'fill-amber-500 text-amber-500' : 'copy-muted'}`}
                />
            ))}
        </div>
    );
}

function Reviews({ reviews, rating }: { reviews: Review[]; rating: { average: number | null; count: number } }) {
    return (
        <section id="reviews" className="mt-20 scroll-mt-28 border-t border-border pt-12 md:mt-32 md:pt-16">
            <div className="mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
                <h2 className="text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl">
                    Reviews <span className="display-ghost">({rating.count})</span>
                </h2>
                {rating.average && (
                    <div className="flex items-center gap-3">
                        <Stars value={rating.average} size="size-5" />
                        <span className="text-sm font-bold">{rating.average} out of 5</span>
                    </div>
                )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {reviews.map((r) => (
                    <div key={r.id} className="space-y-4 rounded-[1.5rem] border border-border p-6 md:rounded-[2rem] md:p-8">
                        <div className="flex items-center justify-between">
                            <Stars value={r.rating} />
                            <span className="text-[11px] font-bold uppercase tracking-[0.1em] copy-muted">{r.created_at}</span>
                        </div>
                        <p className="text-sm font-light leading-relaxed md:text-base">{r.comment}</p>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] copy-muted md:text-[12px]">{r.author}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function RelatedProducts({ related }: { related: Related[] }) {
    return (
        <section className="mt-20 border-t border-border pt-12 md:mt-32 md:pt-16">
            <div className="mb-10 flex items-end justify-between md:mb-14">
                <h2 className="text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl">
                    You might <span className="display-ghost">also like</span>
                </h2>
                <Link
                    href={route('shop.index')}
                    className="shrink-0 text-[12px] font-bold uppercase tracking-[0.14em] copy-muted transition-colors hover:text-foreground"
                >
                    Shop all
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
                {related.map((p, i) => (
                    <Link key={p.id} href={route('shop.show', p.slug)} className="group space-y-4">
                        <VariantPreview
                            images={p.preview_urls?.length ? p.preview_urls : [p.thumbnail_url ?? '']}
                            alt={p.name}
                            delay={i * 500}
                            className="aspect-[4/5] rounded-[1.25rem] border border-border bg-zinc-100 transition-transform duration-700 group-hover:scale-[1.02] dark:bg-zinc-900 md:rounded-[1.75rem]"
                        />
                        <div className="space-y-1 px-1">
                            <h3 className="text-[13px] font-bold uppercase leading-tight tracking-[0.06em] md:text-sm">{p.name}</h3>
                            <p className="text-sm font-light copy-muted">{money(p.price_cents)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
