import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Code2, Shirt } from 'lucide-react';
import React, { useState } from 'react';
import { ThemeToggle } from '../components/theme-toggle';
import { type SharedData } from '../types';

interface Division {
    key: 'software' | 'merch';
    index: string;
    title: string;
    subtitle: string;
    description: string;
    meta: string[];
    cta: string;
    href: string;
}

export default function Brand() {
    const { divisions, auth } = usePage<SharedData & { divisions: Division[] }>().props as any;
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="relative flex min-h-screen flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
            <Head title="Dylanquent — Software & Merch" />

            {/* Masthead */}
            <header className="relative z-20 flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
                <div className="flex flex-col">
                    <span className="font-logo text-lg font-black uppercase tracking-tight md:text-xl">Dylanquent</span>
                    <span className="mt-0.5 text-[11px] font-light uppercase tracking-[0.14em] copy-muted md:text-[12px]">
                        Quiet. Sharp. Daily. · ディランクエント
                    </span>
                </div>
                <div className="flex items-center gap-4 md:gap-5">
                    <ThemeToggle compact />
                    <Link
                        href={auth?.user ? route('dashboard') : route('login')}
                        className="text-[12px] font-bold uppercase tracking-[0.14em] copy-muted transition-colors hover:text-foreground md:text-[13px]"
                    >
                        {auth?.user ? 'Dashboard' : 'Account'}
                    </Link>
                </div>
            </header>

            {/* Statement */}
            <div className="relative z-10 px-5 pb-10 pt-4 text-center md:px-10 md:pb-16">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto max-w-xl text-sm font-light leading-relaxed copy-muted md:text-base"
                >
                    One brand, two disciplines. Software built with intent, and garments made the same way.
                    <span className="mt-2 block text-[12px] font-bold uppercase tracking-[0.16em] copy-muted">
                        Choose a direction
                    </span>
                </motion.p>
            </div>

            {/* Divisions */}
            <main className="relative z-10 flex flex-1 flex-col gap-4 px-4 pb-6 md:flex-row md:gap-6 md:px-8 md:pb-10">
                {divisions.map((division: Division, i: number) => (
                    <DivisionPanel
                        key={division.key}
                        division={division}
                        delay={0.15 + i * 0.12}
                        dimmed={hovered !== null && hovered !== division.key}
                        onHover={setHovered}
                    />
                ))}
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex flex-col items-center justify-between gap-2 border-t border-border px-5 py-5 text-[11px] font-bold uppercase tracking-[0.16em] copy-muted sm:flex-row md:px-10 md:text-[12px]">
                <p>© {new Date().getFullYear()} Dylanquent</p>
                <p>ZA / JHB — Remote</p>
            </footer>
        </div>
    );
}

function DivisionPanel({
    division,
    delay,
    dimmed,
    onHover,
}: {
    division: Division;
    delay: number;
    dimmed: boolean;
    onHover: (key: string | null) => void;
}) {
    const isSoftware = division.key === 'software';
    const Icon = isSoftware ? Code2 : Shirt;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            onMouseEnter={() => onHover(division.key)}
            onMouseLeave={() => onHover(null)}
            className={`flex-1 transition-opacity duration-500 ${dimmed ? 'md:opacity-40' : 'opacity-100'}`}
        >
            <Link
                href={division.href}
                className={`group relative flex h-full min-h-[42vh] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] md:min-h-[54vh] md:rounded-[2.5rem] md:p-12 ${
                    isSoftware
                        ? 'bg-foreground text-background'
                        : 'bg-zinc-50 text-foreground dark:bg-zinc-950'
                }`}
            >
                <AsanohaBG className={isSoftware ? 'opacity-[0.07] scale-150' : 'opacity-10 scale-150'} />

                <div className="relative flex items-start justify-between">
                    <span className={`text-[12px] font-bold uppercase tracking-[0.16em] md:text-[13px] copy-muted`}>
                        {division.index} / {division.subtitle}
                    </span>
                    <Icon className="size-5 copy-ghost md:size-6" />
                </div>

                <div className="relative space-y-5 md:space-y-8">
                    <h2 className="text-[16vw] font-black uppercase leading-[0.8] tracking-tighter sm:text-[11vw] md:text-[7vw] lg:text-[6rem]">
                        {division.title}
                    </h2>
                    <p className={`max-w-md text-sm font-light leading-relaxed md:text-base copy-muted`}>
                        {division.description}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {division.meta.map((m) => (
                            <span
                                key={m}
                                className={`text-[11px] font-bold uppercase tracking-[0.14em] md:text-[12px] copy-muted`}
                            >
                                {m}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <span className="text-[12px] font-bold uppercase tracking-[0.14em] md:text-xs">{division.cta}</span>
                        <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 md:size-5" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function AsanohaBG({ className = '' }: { className?: string }) {
    const svg = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><path d='M60 0l30 60-30 60-30-60z' fill='none' stroke='currentColor' stroke-width='0.5' opacity='0.2'/><path d='M0 60l60-30 60 30-60 30z' fill='none' stroke='currentColor' stroke-width='0.5' opacity='0.2'/></svg>`,
    );
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 ${className}`}
            style={{
                backgroundImage: `url("data:image/svg+xml,${svg}")`,
                backgroundSize: '120px 120px',
                maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
            }}
        />
    );
}
