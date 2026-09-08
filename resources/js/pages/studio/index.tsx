import { Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock, MoveRight } from 'lucide-react';
import React, { FormEvent } from 'react';
import StudioLayout from '../../layouts/studio-layout';

interface Service { index: string; title: string; text: string; points: string[] }
interface Work { name: string; category: string; year: string; text: string; tags: string[]; href: string | null; placeholder: boolean }
interface ProcessStep { step: string; title: string; text: string }
interface Engagement { name: string; price: string; unit: string; duration: string; summary: string; includes: string[]; featured: boolean }
interface AddOn { item: string; price: string }
interface Term { title: string; text: string }

export default function StudioIndex() {
    const { services, work, process, engagements, addOns, terms, stack, projectTypes, budgetRanges, timelines, flash } =
        usePage().props as any;

    return (
        <StudioLayout title="Solo Development Studio">
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
                <Hero />
                <StackStrip stack={stack} />
                <Services services={services} />
                <SelectedWork work={work} />
                <Process process={process} />
                <Pricing engagements={engagements} addOns={addOns} terms={terms} />
                <Contact
                    projectTypes={projectTypes}
                    budgetRanges={budgetRanges}
                    timelines={timelines}
                    flash={flash}
                />
            </div>
        </StudioLayout>
    );
}

function Hero() {
    return (
        <section className="flex min-h-[76vh] flex-col justify-center py-16 md:min-h-[80vh]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.18em] copy-muted md:mb-10 md:text-[13px]">
                    Dylanquent Software / Est. 2026
                </p>
                <h1 className="text-[13vw] font-black uppercase leading-[0.82] tracking-tighter sm:text-[11vw] lg:text-[8.5rem]">
                    Software <br />
                    <span className="copy-ghost">Built Solo.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-base font-light leading-relaxed copy-muted md:mt-12 md:text-xl">
                    One developer, the whole build. No account managers, no handoffs, no team that changes
                    halfway through. You talk to the person writing the code.
                </p>
                <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-bold uppercase tracking-[0.14em] copy-muted md:mt-8 md:text-xs">
                    <span>Sites from R3 500</span>
                    <span aria-hidden="true">/</span>
                    <span>Builds from R9 500</span>
                    <span aria-hidden="true">/</span>
                    <a href="#pricing" className="underline underline-offset-4 transition-opacity hover:opacity-60">
                        Full price list
                    </a>
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-5 md:mt-16"
            >
                <a href="#contact" className="btn-premium group h-14 gap-3 px-10 text-xs md:h-16 md:px-12 md:text-sm">
                    Start a Project <MoveRight className="size-4 transition-transform group-hover:translate-x-2 md:size-5" />
                </a>
                <a
                    href="#work"
                    className="flex h-14 items-center justify-center rounded-full border border-border px-10 text-xs font-black uppercase tracking-[0.1em] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 md:h-16 md:px-12 md:text-sm"
                >
                    See the Work
                </a>
            </motion.div>
        </section>
    );
}

function StackStrip({ stack }: { stack: string[] }) {
    return (
        <section className="border-y border-border py-6 md:py-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:gap-x-10">
                <span className="text-[12px] font-bold uppercase tracking-[0.16em] copy-muted">Stack /</span>
                {stack.map((s: string) => (
                    <span key={s} className="text-[12px] font-bold uppercase tracking-[0.14em] copy-muted md:text-[13px]">
                        {s}
                    </span>
                ))}
            </div>
        </section>
    );
}

function SectionHeading({ eyebrow, title, accent, blurb }: { eyebrow: string; title: string; accent: string; blurb?: string }) {
    return (
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-8 md:mb-16 md:flex-row md:items-end md:pb-10">
            <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] copy-muted md:mb-4 md:text-[13px]">{eyebrow}</p>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl lg:text-7xl">
                    {title} <span className="copy-ghost">{accent}</span>
                </h2>
            </div>
            {blurb && <p className="max-w-lg text-base font-light copy-muted md:text-lg">{blurb}</p>}
        </div>
    );
}

function Services({ services }: { services: Service[] }) {
    return (
        <section id="services" className="scroll-mt-28 pt-20 md:pt-32">
            <SectionHeading
                eyebrow="What I Build"
                title="Services."
                accent=""
                blurb="Four kinds of work. If your project does not fit neatly into one of them, it probably still fits — ask."
            />
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {services.map((s, i) => (
                    <motion.div
                        key={s.index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: (i % 2) * 0.1 }}
                        className="space-y-6 rounded-[2rem] border border-border bg-white p-8 transition-colors hover:border-zinc-400 dark:bg-black md:space-y-8 md:rounded-[2.5rem] md:p-12"
                    >
                        <span className="copy-ghost text-3xl font-black italic md:text-4xl">{s.index}</span>
                        <div className="space-y-4">
                            <h3 className="text-xl font-black uppercase leading-none tracking-tighter md:text-2xl">{s.title}</h3>
                            <p className="text-sm font-light leading-relaxed copy-muted md:text-base">{s.text}</p>
                        </div>
                        <ul className="space-y-2 border-t border-border pt-6">
                            {s.points.map((p) => (
                                <li key={p} className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.1em] copy-muted">
                                    <Check className="size-3 shrink-0" /> {p}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function SelectedWork({ work }: { work: Work[] }) {
    return (
        <section id="work" className="scroll-mt-28 pt-20 md:pt-32">
            <SectionHeading eyebrow="Selected Work" title="The" accent="Archive." />
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                {work.map((project, i) => {
                    const card = (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.7, delay: i * 0.1 }}
                            className={`group flex h-full flex-col justify-between gap-8 rounded-[2rem] border p-8 transition-all md:rounded-[2.5rem] md:p-10 ${
                                project.placeholder
                                    ? 'border-dashed border-zinc-300 bg-transparent dark:border-zinc-800'
                                    : 'border-border bg-white hover:-translate-y-1 hover:border-zinc-400 dark:bg-black'
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-[12px] font-bold uppercase tracking-[0.14em] copy-muted">{project.category}</p>
                                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] copy-ghost">
                                        {project.year}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black uppercase leading-none tracking-tighter md:text-3xl">{project.name}</h3>
                                <p className="text-sm font-light leading-relaxed copy-muted">{project.text}</p>
                            </div>
                            <div className="space-y-5">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] copy-muted"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                {project.href && (
                                    <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em]">
                                        View <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );

                    return project.href ? (
                        <Link key={project.name} href={project.href} className="h-full">
                            {card}
                        </Link>
                    ) : (
                        <div key={project.name} className="h-full">
                            {card}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Process({ process }: { process: ProcessStep[] }) {
    return (
        <section id="process" className="scroll-mt-28 pt-20 md:pt-32">
            <SectionHeading
                eyebrow="How It Runs"
                title="The"
                accent="Process."
                blurb="Four stages, fixed order. You always know which one you are in and what comes next."
            />
            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border md:grid-cols-4 md:rounded-[2.5rem]">
                {process.map((p, i) => (
                    <motion.div
                        key={p.step}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="space-y-5 bg-background p-8 md:space-y-6 md:p-10"
                    >
                        <span className="text-[12px] font-bold uppercase tracking-[0.16em] copy-ghost">{p.step}</span>
                        <h3 className="text-xl font-black uppercase leading-none tracking-tighter md:text-2xl">{p.title}</h3>
                        <p className="text-sm font-light leading-relaxed copy-muted">{p.text}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function Pricing({
    engagements,
    addOns,
    terms,
}: {
    engagements: Engagement[];
    addOns: AddOn[];
    terms: Term[];
}) {
    return (
        <section id="pricing" className="scroll-mt-28 pt-20 md:pt-32">
            <SectionHeading
                eyebrow="What It Costs"
                title="Fixed"
                accent="Pricing."
                blurb="Published, not negotiated in a back room. Every amount below is in South African Rand and excludes VAT."
            />

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                {engagements.map((e, i) => (
                    <motion.div
                        key={e.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                        className={`flex flex-col justify-between gap-8 rounded-[2rem] border p-8 md:rounded-[2.5rem] md:p-10 ${
                            e.featured
                                ? 'border-transparent bg-foreground text-background'
                                : 'border-border bg-white dark:bg-black'
                        }`}
                    >
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tighter md:text-2xl">{e.name}</h3>
                                {e.featured && (
                                    <span className="rounded-full bg-background px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                                        Most Picked
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black tracking-tighter md:text-5xl">{e.price}</p>
                                <span className={`text-[12px] font-bold uppercase tracking-[0.1em] copy-muted`}>
                                    {e.unit}
                                </span>
                            </div>
                            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] copy-muted">
                                <Clock className="size-3 shrink-0" /> {e.duration}
                            </p>
                            <p className="text-sm font-light leading-relaxed copy-muted">{e.summary}</p>
                        </div>
                        <ul className={`space-y-3 border-t pt-6 ${e.featured ? 'border-zinc-500/30' : 'border-border'}`}>
                            {e.includes.map((inc) => (
                                <li
                                    key={inc}
                                    className="flex items-start gap-3 text-[12px] font-bold uppercase tracking-[0.1em] copy-muted"
                                >
                                    <Check className="mt-0.5 size-3 shrink-0" /> {inc}
                                </li>
                            ))}
                        </ul>
                        <a
                            href="#contact"
                            className={`flex h-12 items-center justify-center rounded-full text-[12px] font-bold uppercase tracking-[0.12em] transition-transform hover:scale-[1.02] ${
                                e.featured ? 'bg-background text-foreground' : 'bg-foreground text-background'
                            }`}
                        >
                            Get This Quoted
                        </a>
                    </motion.div>
                ))}
            </div>

            {/* Add-ons — published so a quote can be checked line by line */}
            <div className="mt-6 grid gap-6 rounded-[2rem] border border-border p-8 md:mt-8 md:rounded-[2.5rem] md:p-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
                <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase leading-none tracking-tighter md:text-3xl">
                        Add-ons
                    </h3>
                    <p className="text-sm font-light leading-relaxed copy-muted">
                        Bolt any of these onto a package. Priced up front so you can check a quote line by line —
                        there is no markup hiding in a round number.
                    </p>
                </div>
                <ul className="divide-y divide-border">
                    {addOns.map((a) => (
                        <li key={a.item} className="flex items-baseline justify-between gap-4 py-3">
                            <span className="text-[12px] font-bold uppercase tracking-[0.1em] copy-muted md:text-[13px]">
                                {a.item}
                            </span>
                            <span className="shrink-0 text-sm font-black tracking-tight md:text-base">{a.price}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Terms */}
            <div className="mt-6 grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border md:mt-8 md:grid-cols-4 md:rounded-[2.5rem]">
                {terms.map((t) => (
                    <div key={t.title} className="space-y-3 bg-background p-8 md:p-10">
                        <h4 className="text-base font-black uppercase leading-none tracking-tighter md:text-lg">{t.title}</h4>
                        <p className="text-sm font-light leading-relaxed copy-muted">{t.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Contact({
    projectTypes,
    budgetRanges,
    timelines,
    flash,
}: {
    projectTypes: string[];
    budgetRanges: string[];
    timelines: string[];
    flash?: { success?: string };
}) {
    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        project_type: projectTypes[0] ?? '',
        budget_range: '',
        timeline: '',
        message: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('studio.inquiries.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const fieldClass =
        'h-12 w-full rounded-xl border border-zinc-500/40 bg-transparent px-4 text-sm font-light text-background outline-none transition-colors placeholder:copy-muted focus:border-zinc-500';
    const labelClass = 'mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] copy-muted';

    return (
        <section id="contact" className="scroll-mt-28 pb-10 pt-20 md:pt-32">
            <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-7 text-background md:rounded-[3rem] md:p-14 lg:p-20">
                <div className="relative grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
                    <div className="space-y-6 md:space-y-8">
                        <p className="text-[12px] font-bold uppercase tracking-[0.18em] copy-muted">Start a Project</p>
                        <h2 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter md:text-6xl lg:text-7xl">
                            Tell me <br /> <span className="copy-ghost">what you need.</span>
                        </h2>
                        <p className="max-w-md text-sm font-light leading-relaxed copy-muted md:text-base">
                            A few details is enough to start. You get a reply within one business day — either a
                            scoping call, or an honest no if it is not a fit.
                        </p>
                        <div className="space-y-2 border-t border-zinc-500/30 pt-6 text-[12px] font-bold uppercase tracking-[0.14em] copy-muted">
                            <p>Cape Town, ZA — Remote worldwide</p>
                            <p>Reply within 1 business day</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {(recentlySuccessful || flash?.success) && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-emerald-500">
                                <Check className="size-4 shrink-0" />
                                {flash?.success ?? 'Inquiry received. Reply within one business day.'}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} labelClass={labelClass}>
                                <input
                                    className={fieldClass}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </Field>
                            <Field label="Email" error={errors.email} labelClass={labelClass}>
                                <input
                                    type="email"
                                    className={fieldClass}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                />
                            </Field>
                            <Field label="Company (optional)" error={errors.company} labelClass={labelClass}>
                                <input
                                    className={fieldClass}
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    placeholder="Company"
                                />
                            </Field>
                            <Field label="Phone (optional)" error={errors.phone} labelClass={labelClass}>
                                <input
                                    className={fieldClass}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+27"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <Field label="Project" error={errors.project_type} labelClass={labelClass}>
                                <select
                                    className={fieldClass}
                                    value={data.project_type}
                                    onChange={(e) => setData('project_type', e.target.value)}
                                    required
                                >
                                    {projectTypes.map((t) => (
                                        <option key={t} value={t} className="bg-background text-foreground">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Budget" error={errors.budget_range} labelClass={labelClass}>
                                <select
                                    className={fieldClass}
                                    value={data.budget_range}
                                    onChange={(e) => setData('budget_range', e.target.value)}
                                >
                                    <option value="" className="bg-background text-foreground">
                                        Select
                                    </option>
                                    {budgetRanges.map((b) => (
                                        <option key={b} value={b} className="bg-background text-foreground">
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Timeline" error={errors.timeline} labelClass={labelClass}>
                                <select
                                    className={fieldClass}
                                    value={data.timeline}
                                    onChange={(e) => setData('timeline', e.target.value)}
                                >
                                    <option value="" className="bg-background text-foreground">
                                        Select
                                    </option>
                                    {timelines.map((t) => (
                                        <option key={t} value={t} className="bg-background text-foreground">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="What are you building?" error={errors.message} labelClass={labelClass}>
                            <textarea
                                className="min-h-36 w-full rounded-xl border border-zinc-500/40 bg-transparent px-4 py-3 text-sm font-light text-background outline-none transition-colors placeholder:copy-muted focus:border-zinc-500"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="The problem, who it is for, and where things stand today. A short paragraph is plenty."
                                required
                            />
                        </Field>

                        <button
                            type="submit"
                            disabled={processing}
                            className="h-14 w-full rounded-xl bg-background text-[12px] font-bold uppercase tracking-[0.14em] text-foreground transition-all hover:opacity-90 disabled:opacity-50 md:h-16"
                        >
                            {processing ? 'Sending…' : 'Send Inquiry'}
                        </button>
                        <p className="text-center text-[12px] font-bold uppercase tracking-[0.12em] copy-muted">
                            No newsletter. Your details are used for this project only.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}

function Field({
    label,
    error,
    labelClass,
    children,
}: {
    label: string;
    error?: string;
    labelClass: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            {children}
            {error && <p className="mt-1.5 text-[12px] font-bold uppercase tracking-wider text-red-400">{error}</p>}
        </div>
    );
}
