import AppLogoIcon from '@/components/app-logo-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh items-center justify-center bg-white text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
            <div className="pointer-events-none absolute inset-0">
                <AsanohaBG />
            </div>

            <ThemeToggle compact className="absolute right-5 top-5 z-10 bg-background/80 backdrop-blur md:right-8 md:top-8" />
            <div className="relative w-full max-w-md px-6 py-10 md:px-0">
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative isolate overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm shadow-black/[0.03] dark:border-zinc-800 dark:bg-zinc-950 md:p-8"
                >
                    <MouseSpotlight />

                    <div className="mb-6 flex flex-col items-center gap-3">
                        <Link href={route('home')} className="group inline-flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 transition-colors group-hover:border-zinc-300 dark:border-zinc-800 dark:group-hover:border-zinc-700">
                                <AppLogoIcon className="size-5 fill-current text-zinc-900 dark:text-zinc-100" />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold tracking-tight">Dylanquent</span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Quiet. Sharp. Daily.</span>
                            </div>
                        </Link>
                        <div className="mt-2 space-y-1 text-center">
                            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {children}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

function AsanohaBG() {
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
            className="absolute inset-0"
            style={{
                backgroundImage: `url("data:image/svg+xml,${svg}")`,
                backgroundSize: '120px 120px',
                maskImage: 'linear-gradient(to bottom, black, transparent 95%)',
            }}
        />
    );
}

function MouseSpotlight() {
    const radius = 420;
    return (
        <div
            onMouseMove={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const r = el.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                el.style.setProperty('--mx', `${x}%`);
                el.style.setProperty('--my', `${y}%`);
            }}
            className="pointer-events-none absolute inset-0"
            style={{
                background: `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 40%)`,
                maskImage: 'radial-gradient(500px circle at center, black, transparent 60%)',
            }}
        />
    );
}
