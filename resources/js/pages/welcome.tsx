import StorefrontLayout from '../layouts/storefront-layout';
import { type SharedData } from '../types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MoveRight } from 'lucide-react';

export default function Welcome() {
    const { storefrontSettings } = usePage().props as any;
    const settings = storefrontSettings || {};
    const version = settings.homepage_version || 'premium';

    if (version === 'classic') {
        return <ClassicWelcome settings={settings} />;
    }

    if (version === 'minimal') {
        return <MinimalWelcome settings={settings} />;
    }

    return <PremiumWelcome settings={settings} />;
}

function PremiumWelcome({ settings }: { settings: any }) {
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = (e: FormEvent) => { e.preventDefault(); setSubmitted(true); };

    const parseSetting = (val: any) => {
        if (typeof val === 'string') { try { return JSON.parse(val); } catch (e) { return null; } }
        return val;
    };

    const heroTitle = settings.hero_title || 'Minimalist Streetwear';
    const heroDescription = settings.hero_description || 'Clean silhouettes. Premium fabrics. Zero noise.';
    const ethosFeatures = Array.isArray(parseSetting(settings.ethos_features)) ? parseSetting(settings.ethos_features) : [];
    const featuredProducts = Array.isArray(parseSetting(settings.featured_products)) ? parseSetting(settings.featured_products) : [];

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
                <section className="relative h-[70vh] sm:h-[80vh] lg:h-[85vh] flex items-center justify-center overflow-hidden rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] bg-zinc-50 dark:bg-zinc-950 border border-border mt-20 md:mt-24">
                    <AsanohaBG className="opacity-10 scale-150" />
                    <div className="relative flex flex-col items-center text-center gap-6 md:gap-10 max-w-5xl px-4 md:px-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-black text-zinc-400 mb-4 md:mb-8 italic">Est. 2026 // Prototype 01</p>
                            <h1 className="text-[15vw] sm:text-[12vw] lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-8 md:mb-12">
                                {heroTitle.split(' ')[0]} <br />
                                <span className="text-zinc-200 dark:text-zinc-800">{heroTitle.split(' ')[1] || 'Studio'}</span>
                            </h1>
                            <p className="text-base md:text-xl lg:text-2xl text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed px-4">{heroDescription}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="flex flex-col items-center gap-8 md:gap-12 w-full">
                            <Link href={route('shop.index')} className="h-14 md:h-16 px-10 md:px-12 btn-premium flex items-center gap-3 md:gap-4 group text-xs md:text-sm">
                                Enter Archive <MoveRight className="size-4 md:size-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Marquee />
                        </motion.div>
                    </div>
                </section>

                {featuredProducts.length > 0 && (
                    <section id="drops" className="mt-20 md:mt-32 lg:mt-40">
                        <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 md:pb-10 gap-4 md:gap-6">
                            <div>
                                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-zinc-400 mb-2 md:mb-4 pl-1">Season Drop / 01</p>
                                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">The Featured <span className="text-zinc-200 dark:text-zinc-800">Edit</span></h2>
                            </div>
                            <Link href={route('shop.index')} className="text-[9px] md:text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:gap-5 transition-all flex items-center gap-2">Explore All <ArrowRight className="size-3 md:size-4" /></Link>
                        </div>
                        <div className="grid gap-6 md:gap-8 lg:gap-10 grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((p: any, i: number) => <DropCard key={p.name} product={p} delay={i * 0.1} />)}
                        </div>
                    </section>
                )}

                <section id="ethos" className="mt-20 md:mt-32 lg:mt-40">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-end mb-16 md:mb-24 pb-8 md:pb-12 border-b border-border">
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none">Our <span className="text-zinc-200 dark:text-zinc-800">Protocol.</span></h2>
                        <p className="text-base md:text-xl text-zinc-500 font-light max-w-lg">We believe in intentional construction and the elimination of the unnecessary. Every piece is a proof of concept.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                        {(ethosFeatures.length > 0 ? ethosFeatures : [
                            { title: 'Japanese Precision', text: 'Patterns drafted with absolute geometric intent.' },
                            { title: 'Heavy Cotton', text: '400GSM+ frameworks for longevity and structural silence.' },
                            { title: 'Digital Shell', text: 'Each item is connected to its own blockchain-verified archive.' }
                        ]).map((feature: any, i: number) => (
                            <div key={i} className="p-8 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-border bg-white dark:bg-black space-y-6 md:space-y-8 hover:border-zinc-400 transition-all">
                                <span className="text-3xl md:text-4xl font-black italic text-zinc-100 dark:text-zinc-900">0{i + 1}</span>
                                <div className="space-y-3 md:space-y-4">
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">{feature.title}</h3>
                                    <p className="text-sm md:text-base text-zinc-500 font-light leading-relaxed">{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-20 md:mt-32 lg:mt-40 mb-12 md:mb-20 px-2 md:px-4">
                    <div className="rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] bg-foreground text-background p-8 md:p-16 lg:p-32 relative overflow-hidden text-center">
                        <AsanohaBG className="opacity-5 scale-150 rotate-45" />
                        <div className="relative max-w-3xl mx-auto space-y-8 md:space-y-12">
                            <h2 className="text-3xl md:text-5xl lg:text-8xl font-black uppercase tracking-tighter leading-none">Access <br /> <span className="text-zinc-600">Granted.</span></h2>
                            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <input type="email" placeholder="YOUR@IDENTITY.COM" className="h-14 md:h-16 flex-1 bg-background text-foreground rounded-xl md:rounded-2xl px-6 md:px-8 text-[10px] md:text-xs font-black uppercase tracking-widest outline-none" required />
                                <button type="submit" className="h-14 md:h-16 px-8 md:px-12 bg-zinc-800 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">{submitted ? 'Verified' : 'Initialize'}</button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </StorefrontLayout>
    );
}

function ClassicWelcome({ settings }: { settings: any }) {
    const parseSetting = (val: any) => {
        if (typeof val === 'string') { try { return JSON.parse(val); } catch (e) { return null; } }
        return val;
    };

    const heroTitle = settings.hero_title || 'Minimalist Streetwear';
    const heroSubtitle = settings.hero_subtitle || 'Built for everyday movement.';
    const heroDescription = settings.hero_description || 'Clean silhouettes. Premium fabrics. Zero noise.';
    const ethosFeatures = Array.isArray(parseSetting(settings.ethos_features)) ? parseSetting(settings.ethos_features) : [];
    const featuredProducts = Array.isArray(parseSetting(settings.featured_products)) ? parseSetting(settings.featured_products) : [];

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-border bg-zinc-50/50 p-8 dark:bg-zinc-900/30 lg:p-14">
                    <AsanohaBG className="opacity-10" />
                    <div className="relative grid items-center gap-12 lg:grid-cols-2">
                        <div className="space-y-10">
                            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl uppercase">
                                {heroTitle} <br />
                                <span className="text-zinc-400 font-light">{heroSubtitle}</span>
                            </motion.h1>
                            <p className="text-lg leading-relaxed text-zinc-500 font-light max-w-xl">{heroDescription}</p>
                            <div className="flex flex-wrap gap-4">
                                <Link href={route('shop.index')} className="h-14 px-10 btn-premium">View Drop</Link>
                                <a href="#newsletter" className="h-14 px-10 rounded-full border border-border flex items-center justify-center text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-zinc-800 transition-all">Get Access</a>
                            </div>
                        </div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl">
                            <img src={featuredProducts[0]?.image || '/images/products/heavy_hoodie_grey_1769346878833.png'} className="w-full h-full object-cover grayscale-[0.2]" />
                            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/60 to-transparent text-white">
                                <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60 mb-2">Winter Collection</p>
                                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{featuredProducts[0]?.name || 'Heavy Hoodie'}</h2>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <div className="mt-24 grid md:grid-cols-3 gap-8">
                    {ethosFeatures.map((f: any, i: number) => (
                        <div key={i} className="p-10 rounded-[2.5rem] border border-border bg-white dark:bg-black/50 space-y-6">
                            <div className="size-12 rounded-2xl bg-foreground text-background flex items-center justify-center font-black italic text-xl">0{i + 1}</div>
                            <h3 className="text-xl font-black uppercase tracking-tight">{f.title}</h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed">{f.text}</p>
                        </div>
                    ))}
                </div>

                <section className="mt-32">
                    <div className="flex items-end justify-between border-b border-border pb-10 mb-16 px-4">
                        <h2 className="text-5xl font-black uppercase tracking-tighter">Latest <span className="text-zinc-200 dark:text-zinc-800 not-italic">Drops</span></h2>
                        <Link href={route('shop.index')} className="text-xs font-black uppercase tracking-widest">See All</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map((p: any, i: number) => (
                            <Link key={i} href={p.slug ? route('shop.show', p.slug) : route('shop.index')} className="group space-y-6">
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border group-hover:scale-[1.02] transition-transform duration-500">
                                    <img src={p.image} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                                <div className="px-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest">{p.name}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Prototype / Season 01</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </StorefrontLayout>
    );
}

function MinimalWelcome({ settings }: { settings: any }) {
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = (e: FormEvent) => { e.preventDefault(); setSubmitted(true); };

    const parseSetting = (val: any) => {
        if (typeof val === 'string') { try { return JSON.parse(val); } catch (e) { return null; } }
        return val;
    };

    const heroTitle = settings.hero_title || 'Dylanquent';
    const heroDescription = settings.hero_description || 'Clean design. Premium quality. Nothing unnecessary.';
    const ethosFeatures = Array.isArray(parseSetting(settings.ethos_features)) ? parseSetting(settings.ethos_features) : [];

    return (
        <StorefrontLayout>
            <div className="min-h-screen flex flex-col">
                {/* Hero Section */}
                <div className="flex-1 flex items-center justify-center px-4 md:px-6 lg:px-10 pt-20 pb-16 md:pb-24">
                    <div className="max-w-2xl text-center space-y-8 md:space-y-12">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] uppercase">
                                {heroTitle}
                            </h1>
                        </motion.div>

                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
                            {heroDescription}
                        </motion.p>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-8">
                            <Link href={route('shop.index')} className="h-12 md:h-14 px-8 md:px-10 btn-premium flex items-center justify-center gap-2 text-sm md:text-base group">
                                Explore <ArrowRight className="size-4 md:size-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="h-12 md:h-14 px-8 md:px-10 rounded-lg border border-border flex items-center justify-center text-sm md:text-base font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                Learn More
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="border-t border-border px-4 md:px-6 lg:px-10 py-16 md:py-24 lg:py-32 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="max-w-7xl mx-auto">
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16 md:mb-24">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-6">Our Values</h2>
                            <div className="h-1 w-16 md:w-20 bg-foreground rounded-full"></div>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            {(ethosFeatures.length > 0 ? ethosFeatures : [
                                { title: 'Intentional', text: 'Every detail is deliberate and purposeful.' },
                                { title: 'Timeless', text: 'Design that transcends seasonal trends.' },
                                { title: 'Transparent', text: 'We believe in honest pricing and quality.' }
                            ]).map((feature: any, i: number) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="space-y-4 md:space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{feature.title}</h3>
                                        <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">{feature.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="px-4 md:px-6 lg:px-10 py-16 md:py-24">
                    <div className="max-w-2xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8 text-center">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase">Stay Updated</h2>
                                <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light">Get notified when new drops are available.</p>
                            </div>

                            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <input type="email" placeholder="your@email.com" className="h-12 md:h-14 flex-1 bg-white dark:bg-black border border-border rounded-lg px-6 md:px-8 text-sm font-medium outline-none focus:border-foreground transition-colors" required />
                                <button type="submit" className="h-12 md:h-14 px-8 md:px-10 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                                    {submitted ? '✓ Confirmed' : 'Subscribe'}
                                </button>
                            </form>

                            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 font-light">We respect your inbox. No spam, ever.</p>
                        </motion.div>
                    </div>
                </section>
            </div>
        </StorefrontLayout>
    );
}

function Marquee() {
    const items = ['Minimal Cuts', 'Heavy Cotton', 'Limited Drops', 'ディランクエント', 'Quiet Streetwear'];
    return (
        <div className="relative w-full overflow-hidden py-10 opacity-30">
            <div className="animate-[marq_40s_linear_infinite] whitespace-nowrap text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                {items.concat(items).concat(items).map((t, i) => <span key={i} className="mx-16 italic">{t}</span>)}
            </div>
            <style>{`@keyframes marq { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
        </div>
    );
}

function DropCard({ product, delay }: { product: any, delay: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay }} className="group relative cursor-pointer">
            <div className="relative aspect-[3/4.2] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-border bg-zinc-50 shadow-sm dark:bg-zinc-950 transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                <img src={product.image || '/images/placeholder.png'} alt={product.name} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute top-4 left-4 md:top-6 md:left-6 lg:top-8 lg:left-8"><span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl">Drop / {product.tag}</span></div>
                <div className="hidden md:block absolute bottom-0 inset-x-0 p-6 lg:p-10 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    <Link href={product.slug ? route('shop.show', product.slug) : route('shop.index')}>
                        <button className="w-full h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-white text-black text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-100 transition-all">
                            {product.slug ? 'View Product' : 'Coming Soon'}
                        </button>
                    </Link>
                </div>
            </div>
            <div className="mt-4 md:mt-6 lg:mt-8 space-y-1.5 md:space-y-2 px-2 md:px-4 transition-all group-hover:px-3 md:group-hover:px-6">
                <p className="text-sm md:text-base lg:text-lg font-black uppercase tracking-tighter leading-none">{product.name}</p>
                <div className="flex items-center justify-between"><p className="text-[8px] md:text-[10px] text-zinc-400 font-bold tracking-[0.3em] uppercase opacity-60">Status: Pending</p><div className="size-1.5 md:size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" /></div>
            </div>
        </motion.div>
    );
}

function AsanohaBG({ className = '' }: { className?: string }) {
    const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><path d='M60 0l30 60-30 60-30-60z' fill='none' stroke='currentColor' stroke-width='0.5' opacity='0.2'/><path d='M0 60l60-30 60 30-60 30z' fill='none' stroke='currentColor' stroke-width='0.5' opacity='0.2'/></svg>`);
    return <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} style={{ backgroundImage: `url("data:image/svg+xml,${svg}")`, backgroundSize: '120px 120px', maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }} />;
}