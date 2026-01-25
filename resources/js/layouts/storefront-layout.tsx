import { type SharedData } from '../types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export default function StorefrontLayout({ children, title }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background">
            <Head title={title ? `${title} — Dylanquent` : 'Dylanquent — Minimalist Streetwear'} />

            {/* Navigation */}
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3 md:py-4 glass-panel' : 'py-4 md:py-8 bg-transparent'}`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between">
                    {/* Left: Menu Trigger (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Link href={route('shop.index')} className="hover:opacity-50 transition-opacity">Shop</Link>
                        <Link href="/#ethos" className="hover:opacity-50 transition-opacity">Ethos</Link>
                        <Link href="/#drops" className="hover:opacity-50 transition-opacity">Drops</Link>
                    </nav>

                    {/* Mobile: Hamburger Menu (Left) */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="size-5" />
                    </button>

                    {/* Center: Logo */}
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-start group">
                        <span className="text-lg md:text-xl lg:text-2xl font-logo font-black uppercase tracking-tight transition-transform duration-500 group-hover:scale-105">Dylanquent</span>
                        <span className="hidden sm:block text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-light text-zinc-400 mt-0.5">
                            Quiet. Sharp. Daily. · ディランクエント
                        </span>
                    </Link>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="hidden sm:block hover:opacity-50 transition-opacity">
                            <Search className="size-5" />
                        </button>
                        <Link href={route('cart.index')} className="relative group">
                            <ShoppingBag className="size-5 group-hover:scale-110 transition-transform" />
                            {usePage<SharedData>().props.cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 size-4 bg-foreground text-background text-[8px] font-black flex items-center justify-center rounded-full">
                                    {usePage<SharedData>().props.cartCount}
                                </span>
                            )}
                        </Link>
                        <Link href={auth.user ? route('dashboard') : route('login')} className="hidden sm:block hover:opacity-50 transition-opacity">
                            <User className="size-5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background lg:hidden"
                    >
                        <div className="p-8 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-20">
                                <div className="flex flex-col">
                                    <span className="text-xl font-logo font-black uppercase tracking-tight">Dylanquent</span>
                                    <span className="text-[8px] uppercase tracking-[0.3em] font-light text-zinc-400 mt-0.5">Quiet. Sharp. Daily.</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="size-6" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-8 text-4xl font-black uppercase tracking-tighter">
                                <Link onClick={() => setIsMobileMenuOpen(false)} href={route('shop.index')}>Shop</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/#ethos">Ethos</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href="/#drops">Drops</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href={route('cart.index')}>Cart</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} href={auth.user ? route('dashboard') : route('login')}>Account</Link>
                            </nav>
                            <div className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-800 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                JP / TYO &mdash; ZA / CPT
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-24 min-h-screen">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-border mt-40">
                <div className="max-w-7xl mx-auto px-6 py-24 lg:px-10">
                    <div className="grid gap-16 lg:grid-cols-4">
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-logo font-black uppercase tracking-tight">Dylanquent</h2>
                                <p className="text-[9px] uppercase tracking-[0.3em] font-light text-zinc-400 mt-1">Quiet. Sharp. Daily. · ディランクエント</p>
                            </div>
                            <p className="text-zinc-500 max-w-sm font-light leading-relaxed">
                                An experimental design studio focused on high-fidelity minimalist streetwear. Digital soul, physical shell.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Shop</h4>
                            <ul className="space-y-3 text-xs font-black uppercase tracking-widest text-zinc-500">
                                <li><Link href={route('shop.index')} className="hover:text-foreground transition-colors">Catalog</Link></li>
                                <li><Link href="/#drops" className="hover:text-foreground transition-colors">Recent Drops</Link></li>
                                <li><Link href="/#ethos" className="hover:text-foreground transition-colors">Process</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Legal</h4>
                            <ul className="space-y-3 text-xs font-black uppercase tracking-widest text-zinc-500">
                                <li><a href="#" className="hover:text-foreground transition-colors">Shipping</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Returns</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-24 pt-10 border-t border-border flex flex-col sm:flex-row justify-between items-center text-[9px] uppercase tracking-[0.5em] font-black text-zinc-400 gap-4">
                        <p>© {new Date().getFullYear()} Dylanquent Inc.</p>
                        <p>Intentional. Quiet. Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
