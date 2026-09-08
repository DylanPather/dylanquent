import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type SharedData } from '../types';

interface Props {
    children: React.ReactNode;
    title?: string;
}

const NAV = [
    { label: 'Services', href: '/studio#services' },
    { label: 'Work', href: '/studio#work' },
    { label: 'Process', href: '/studio#process' },
    { label: 'Pricing', href: '/studio#pricing' },
];

export default function StudioLayout({ children, title }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
            <Head title={title ? `${title} — Dylanquent Software` : 'Dylanquent Software — Solo Development Studio'} />

            <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5 md:py-7'}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 lg:px-10">
                    <Link href="/" className="group flex flex-col">
                        <span className="font-logo text-base font-black uppercase tracking-tight transition-transform duration-500 group-hover:scale-105 md:text-lg">
                            Dylanquent
                        </span>
                        <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.15em] copy-muted">01 / Software</span>
                    </Link>

                    <nav className="hidden items-center gap-7 text-[12px] font-bold uppercase tracking-[0.14em] md:flex lg:gap-9">
                        {NAV.map((item) => (
                            <a key={item.href} href={item.href} className="transition-opacity hover:opacity-50">
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4 md:gap-6">
                        <Link
                            href={route('merch.home')}
                            className="hidden text-[12px] font-bold uppercase tracking-[0.14em] copy-muted transition-colors hover:text-foreground sm:block"
                        >
                            Merch ↗
                        </Link>
                        <a
                            href="/studio#contact"
                            className="hidden h-10 items-center rounded-full bg-foreground px-6 text-[12px] font-bold uppercase tracking-[0.12em] text-background transition-transform hover:scale-105 md:inline-flex"
                        >
                            Start a Project
                        </a>
                        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                            <Menu className="size-5" />
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-background md:hidden"
                    >
                        <div className="flex h-full flex-col p-8">
                            <div className="mb-16 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-logo text-xl font-black uppercase tracking-tight">Dylanquent</span>
                                    <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.15em] copy-muted">01 / Software</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-7 text-4xl font-black uppercase tracking-tighter">
                                {NAV.map((item) => (
                                    <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                        {item.label}
                                    </a>
                                ))}
                                <a href="/studio#contact" onClick={() => setIsMobileMenuOpen(false)}>
                                    Contact
                                </a>
                                <Link href={route('merch.home')} onClick={() => setIsMobileMenuOpen(false)} className="copy-muted">
                                    Merch
                                </Link>
                            </nav>
                            <div className="mt-auto border-t border-border pt-8">
                                <Link
                                    href={auth.user ? route('dashboard') : route('login')}
                                    className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted"
                                >
                                    {auth.user ? 'Dashboard' : 'Account'}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="pt-24">{children}</main>

            <footer className="mt-32 border-t border-border bg-zinc-50 dark:bg-zinc-950">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                    <div className="grid gap-14 lg:grid-cols-4">
                        <div className="space-y-6 lg:col-span-2">
                            <div>
                                <h2 className="font-logo text-2xl font-black uppercase tracking-tight">Dylanquent</h2>
                                <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.15em] copy-muted">
                                    Software · Solo Development Studio
                                </p>
                            </div>
                            <p className="max-w-sm font-light leading-relaxed copy-muted">
                                One developer, end to end. Web platforms, commerce systems and internal tools —
                                scoped honestly, built carefully, shipped to production.
                            </p>
                        </div>
                        <div className="space-y-5">
                            <h4 className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted">Studio</h4>
                            <ul className="space-y-3 text-xs font-black uppercase tracking-[0.1em] copy-muted">
                                {NAV.map((item) => (
                                    <li key={item.href}>
                                        <a href={item.href} className="transition-colors hover:text-foreground">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                                <li>
                                    <a href="/studio#contact" className="transition-colors hover:text-foreground">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-5">
                            <h4 className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted">Brand</h4>
                            <ul className="space-y-3 text-xs font-black uppercase tracking-[0.1em] copy-muted">
                                <li>
                                    <Link href="/" className="transition-colors hover:text-foreground">
                                        Overview
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('merch.home')} className="transition-colors hover:text-foreground">
                                        Merch
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('shop.index')} className="transition-colors hover:text-foreground">
                                        Shop
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-[12px] font-bold uppercase tracking-[0.16em] copy-muted sm:flex-row">
                        <p>© {new Date().getFullYear()} Dylanquent</p>
                        <p>Scoped. Built. Shipped.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
