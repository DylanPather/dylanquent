// resources/js/Pages/Welcome.tsx
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import hero from '../../images/herosection_bg.jpg';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // TODO: Hook this to newsletter backend (e.g., router.post(...))
    };

    const fadeUp = useMemo(
        () => ({
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        }),
        []
    );

    const gallery = [
        { name: 'Boxy Tee', tag: '01' },
        { name: 'Heavy Hoodie', tag: '02' },
        { name: 'Cargo Trouser', tag: '03' },
        { name: 'Cap / DLQ', tag: '04' },
    ];

    return (
        <>
            <Head title="Dylanquent — Minimalist Streetwear">
                <meta
                    name="description"
                    content="Dylanquent — modern, minimalist streetwear. Clean cuts. Premium feel. Limited drops."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
                {/* JSON-LD (brand+org) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Dylanquent',
                            url: 'https://example.com',
                            brand: { '@type': 'Brand', name: 'Dylanquent' },
                            sameAs: ['https://instagram.com/yourhandle'],
                        }),
                    }}
                />
            </Head>

            <div className="min-h-svh bg-white text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
                {/* Top nav */}
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
                    <Link href="/" className="group inline-flex items-center gap-3">
                        {/* <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 transition-colors group-hover:border-zinc-300 dark:border-zinc-800 dark:group-hover:border-zinc-700">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                                <path d="M6 5h6.5a6.5 6.5 0 1 1 0 13H6z" className="fill-black dark:fill-white" />
                                <rect x="6" y="5" width="2" height="14" className="fill-zinc-500" />
                            </svg>
                        </span> */}
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold tracking-tight">Dylanquent</span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                Quiet. Sharp. Daily. · <span className="font-medium">ディランクエント</span>
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm md:flex">
                        <a href="#drops" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Drops</a>
                        <a href="#ethos" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Ethos</a>
                        <a href="#newsletter" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Notify</a>
                        <span aria-hidden className="select-none text-zinc-300 dark:text-zinc-700">|</span>
                        <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">EN / JP</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white">
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-90 dark:bg-white dark:text-black"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Hero */}
                <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-4 lg:px-10">
                    <motion.section
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="relative isolate overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 lg:p-14"
                    >
                        <MouseSpotlight />
                        <AsanohaBG />

                        <div className="relative grid items-center gap-10 lg:grid-cols-2">
                            {/* Left text */}
                            <div>
                                <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                                    Minimalist Streetwear
                                    <span className="block text-zinc-500 dark:text-zinc-400">Built for everyday movement.</span>
                                </h1>
                                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    Clean silhouettes. Premium fabrics. Zero noise. Dylanquent launches soon with limited-run essentials.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <a
                                        href="#drops"
                                        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                                    >
                                        View lookbook
                                    </a>
                                    <a
                                        href="#newsletter"
                                        className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                                    >
                                        Get drop alerts
                                    </a>
                                </div>

                                <Marquee />
                            </div>

                            {/* Right — video / image placeholder */}
                            <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <img src={hero} alt="Hero" className="w-full object-cover" />
                            </div>
                        </div>
                    </motion.section>

                    {/* Ethos */}
                    <section id="ethos" className="mx-auto mt-14 grid gap-6 lg:grid-cols-3">
                        {[
                            { title: 'Cut', text: 'Relaxed but refined. Tailored lines that move with you.' },
                            { title: 'Fabric', text: 'Heavyweight cottons and technical blends for all-day wear.' },
                            { title: 'Design', text: 'Anime nods. Never cosplay. Essential marks only.' },
                        ].map((f) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="relative overflow-hidden rounded-xl border border-zinc-200 p-6 shadow-sm shadow-black/[0.03] dark:border-zinc-800"
                            >
                                <h3 className="mb-2 text-sm font-semibold tracking-tight">{f.title}</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.text}</p>
                                <AsanohaBG className="opacity-40" />
                            </motion.div>
                        ))}
                    </section>

                    {/* Culture Bento */}
                    <section className="mt-14 grid gap-4 sm:grid-cols-3">
                        {[
                            { t: 'Craft', d: 'Asanoha lines, heavyweight builds.' },
                            { t: 'Culture', d: 'Japanese minimal. Anime references, low volume.' },
                            { t: 'Community', d: 'Small drops. Early access to the list.' },
                        ].map((x) => (
                            <div
                                key={x.t}
                                className="relative overflow-hidden rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
                            >
                                <h4 className="text-sm font-semibold tracking-tight">{x.t}</h4>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{x.d}</p>
                                {/* Tailwind image placeholder background (subtle) */}
                                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,0.05),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.06),transparent_70%)]" />
                            </div>
                        ))}
                    </section>

                    {/* Drops */}
                    <section id="drops" className="mt-14">
                        <div className="mb-6 flex items-end justify-between">
                            <h2 className="text-lg font-semibold tracking-tight">First Drop — Core Essentials</h2>
                            <Link href="#" className="text-sm text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white">See all</Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {gallery.map((p, i) => (
                                <DropCard key={p.name} product={p} delay={i * 0.05} />
                            ))}
                        </div>
                    </section>

                    {/* Newsletter */}
                    <section id="newsletter" className="mt-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800 lg:p-8"
                        >
                            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight">Be first to know.</h3>
                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                        Join the Dylanquent list for early access and limited-drop alerts.
                                    </p>
                                </div>
                                <form onSubmit={onSubmit} className="flex w-full max-w-md items-center gap-2">
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-black/10 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex shrink-0 items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 dark:bg-white dark:text-black"
                                    >
                                        {submitted ? 'Thanks!' : 'Notify me'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="mx-auto w-full max-w-7xl px-6 py-10 text-xs text-zinc-500 lg:px-10">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} Dylanquent. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">Privacy</a>
                            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">Terms</a>
                            <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* =========================
   Components
   ========================= */

function ThemeToggle() {
    const [dark, setDark] = useState<boolean>(() =>
        typeof window !== 'undefined'
            ? (localStorage.getItem('theme') ?? 'dark') === 'dark'
            : true
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    return (
        <button
            onClick={() => setDark((v) => !v)}
            className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Toggle theme"
        >
            {dark ? 'Light' : 'Dark'}
        </button>
    );
}

function AsanohaBG({ className = '' }: { className?: string }) {
    const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
      <g fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.06'>
        <path d='M60 0l30 60-30 60-30-60z'/>
        <path d='M0 60l60-30 60 30-60 30z'/>
      </g>
    </svg>
  `);
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 ${className}`}
            style={{
                backgroundImage: `url("data:image/svg+xml,${svg}")`,
                backgroundSize: '120px 120px',
                maskImage: 'linear-gradient(to bottom, black, transparent 95%)',
            }}
        />
    );
}

function Marquee() {
    const items = [
        'Minimal Cuts', 'Heavy Cotton', 'Limited Drops', 'ディランクエント', 'Quiet Streetwear',
    ];
    return (
        <div className="relative mt-8 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
            <div className="animate-[marq_24s_linear_infinite] whitespace-nowrap py-2 text-xs text-zinc-600 dark:text-zinc-400">
                {items.concat(items).map((t, i) => (
                    <span key={i} className="mx-6 tracking-wide">{t} •</span>
                ))}
            </div>
            <style>{`@keyframes marq { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
    );
}

function DropCard({ product, delay }: { product: { name: string; tag: string }, delay: number }) {
    const [mx, setMx] = useState(0);
    const [my, setMy] = useState(0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            onMouseMove={(e) => {
                const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setMx(((e.clientX - r.left) / r.width - 0.5) * 10);
                setMy(((e.clientY - r.top) / r.height - 0.5) * -10);
            }}
            style={{ transform: `perspective(900px) rotateX(${my}deg) rotateY(${mx}deg)` }}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950"
        >
            {/* Tailwind image placeholder */}
            <div className="relative aspect-square w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800" />
                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden
                >
                    <span className="text-[11px] tracking-widest text-zinc-500 dark:text-zinc-400">
                        PRODUCT IMAGE PLACEHOLDER
                    </span>
                </div>
                {/* Glare on hover */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background:
                            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%)',
                    }}
                />
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-zinc-500">Drop {product.tag}</p>
                </div>
                <button
                    aria-label="Preview"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                    Preview
                </button>
            </div>
        </motion.div>
    );
}

function MouseSpotlight() {
    const [pos, setPos] = useState({ x: 50, y: 50 });
    return (
        <div
            onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setPos({ x, y });
            }}
            className="pointer-events-none absolute inset-0"
            style={{
                background: `radial-gradient(500px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.08), transparent 40%)`,
                maskImage: 'radial-gradient(500px circle at center, black, transparent 60%)',
            }}
        />
    );
}