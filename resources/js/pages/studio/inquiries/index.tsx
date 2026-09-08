import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Check,
    Mail,
    Phone,
    Search,
    Trash2,
    Wallet,
} from 'lucide-react';
import * as React from 'react';

interface Inquiry {
    id: number;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    project_type: string;
    budget_range: string | null;
    timeline: string | null;
    message: string;
    status: string;
    internal_notes: string | null;
    created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    qualified: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    proposal: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    lost: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export default function StudioInquiriesIndex() {
    const { inquiries, filters, statuses, stats, flash } = usePage().props as any;
    const [search, setSearch] = React.useState(filters.search || '');
    const [expanded, setExpanded] = React.useState<number | null>(null);

    const applyFilters = (next: { status?: string; search?: string }) => {
        router.get(
            route('studio.inquiries.index'),
            { status: next.status ?? filters.status, search: next.search ?? search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: route('studio.inquiries.index') },
                { title: 'Project Inquiries', href: route('studio.inquiries.index') },
            ]}
        >
            <Head title="Project Inquiries" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Project Inquiries</h1>
                        <p className="text-sm text-muted-foreground">
                            Leads from the software studio landing page.
                        </p>
                    </div>
                    <Link
                        href="/studio#contact"
                        className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                    >
                        View public form →
                    </Link>
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Check className="size-4" /> {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total" value={stats.total} />
                    <StatCard label="New" value={stats.new} accent="text-blue-600 dark:text-blue-400" />
                    <StatCard label="Open" value={stats.open} accent="text-amber-600 dark:text-amber-400" />
                    <StatCard label="Won" value={stats.won} accent="text-emerald-600 dark:text-emerald-400" />
                </div>

                <Card>
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search name, email or company…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', ...statuses].map((s: string) => (
                                <button
                                    key={s}
                                    onClick={() => applyFilters({ status: s })}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                        filters.status === s
                                            ? 'bg-foreground text-background'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {inquiries.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                            <Mail className="size-8 text-muted-foreground" />
                            <p className="font-medium">No inquiries yet</p>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Submissions from the studio contact form land here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-3">
                        {inquiries.data.map((inquiry: Inquiry) => (
                            <InquiryRow
                                key={inquiry.id}
                                inquiry={inquiry}
                                statuses={statuses}
                                isExpanded={expanded === inquiry.id}
                                onToggle={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                            />
                        ))}
                    </div>
                )}

                {inquiries.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Page {inquiries.current_page} of {inquiries.last_page} · {inquiries.total} total
                        </span>
                        <div className="flex gap-2">
                            {inquiries.prev_page_url && (
                                <Link href={inquiries.prev_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                                    Previous
                                </Link>
                            )}
                            {inquiries.next_page_url && (
                                <Link href={inquiries.next_page_url} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={`mt-1 text-2xl font-semibold ${accent ?? ''}`}>{value}</p>
            </CardContent>
        </Card>
    );
}

function InquiryRow({
    inquiry,
    statuses,
    isExpanded,
    onToggle,
}: {
    inquiry: Inquiry;
    statuses: string[];
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const { data, setData, put, processing } = useForm({
        status: inquiry.status,
        internal_notes: inquiry.internal_notes ?? '',
    });

    const save = () => put(route('studio.inquiries.update', inquiry.id), { preserveScroll: true });

    const setStatus = (status: string) => {
        setData('status', status);
        router.put(
            route('studio.inquiries.update', inquiry.id),
            { status, internal_notes: data.internal_notes },
            { preserveScroll: true },
        );
    };

    const remove = () => {
        if (confirm(`Delete the inquiry from ${inquiry.name}? This cannot be undone.`)) {
            router.delete(route('studio.inquiries.destroy', inquiry.id), { preserveScroll: true });
        }
    };

    return (
        <Card>
            <CardContent className="p-0">
                <button onClick={onToggle} className="flex w-full flex-col gap-3 p-4 text-left md:flex-row md:items-center md:gap-6">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{inquiry.name}</span>
                            <Badge className={`capitalize ${STATUS_STYLES[inquiry.status] ?? ''}`} variant="secondary">
                                {inquiry.status}
                            </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                            {inquiry.project_type}
                            {inquiry.company ? ` · ${inquiry.company}` : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        {inquiry.budget_range && (
                            <span className="flex items-center gap-1.5">
                                <Wallet className="size-3.5" /> {inquiry.budget_range}
                            </span>
                        )}
                        {inquiry.timeline && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="size-3.5" /> {inquiry.timeline}
                            </span>
                        )}
                        <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                    </div>
                </button>

                {isExpanded && (
                    <div className="grid gap-6 border-t p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 hover:underline">
                                    <Mail className="size-3.5" /> {inquiry.email}
                                </a>
                                {inquiry.phone && (
                                    <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1.5 hover:underline">
                                        <Phone className="size-3.5" /> {inquiry.phone}
                                    </a>
                                )}
                                {inquiry.company && (
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Building2 className="size-3.5" /> {inquiry.company}
                                    </span>
                                )}
                            </div>
                            <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                {inquiry.message}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s)}
                                            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                                data.status === s
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Internal notes
                                </p>
                                <Textarea
                                    value={data.internal_notes}
                                    onChange={(e) => setData('internal_notes', e.target.value)}
                                    placeholder="Call outcome, scope thoughts, next step…"
                                    className="min-h-24"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={save} disabled={processing} size="sm">
                                    {processing ? 'Saving…' : 'Save notes'}
                                </Button>
                                <Button onClick={remove} variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
