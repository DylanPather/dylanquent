import { type Column, EmptyState, PageHeader, ResponsiveTable, SearchInput, StatCard, StatGrid } from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { SearchX, ShoppingCart } from 'lucide-react';
import * as React from 'react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_cents: number;
    currency: string;
    items_count: number;
    placed_at: string | null;
    customer_name: string | null;
    customer_email: string | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Filters { search: string; status: string; payment_status: string; sort: string }

const breadcrumbs = [
    { title: 'Sales', href: '/sales/orders' },
    { title: 'Orders', href: '/sales/orders' },
];

const ANY = 'any';
const money = (cents: number) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Keyed by both order status (App\Enums\OrderStatus) and payment status.
const STATUS_TONE: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    payment_failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
    paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    processing: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    fulfilled: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-muted text-muted-foreground',
    refunded: 'bg-muted text-muted-foreground',
    partially_refunded: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
    failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function StatusBadge({ value }: { value: string }) {
    return (
        <Badge variant="secondary" className={STATUS_TONE[value] ?? ''}>
            {titleCase(value)}
        </Badge>
    );
}

export default function OrdersIndex() {
    const { orders, filters, statuses, paymentStatuses, stats } = usePage().props as unknown as {
        orders: Paginator<Order>;
        filters: Filters;
        statuses: string[];
        paymentStatuses: string[];
        stats: { total: number; awaiting_payment: number; to_fulfil: number; revenue_cents: number };
    };

    const [busy, setBusy] = React.useState(false);
    const rows = orders?.data ?? [];
    const hasFilters = !!(filters.search || filters.status || filters.payment_status);

    const apply = (patch: Partial<Filters>) => {
        const next: Record<string, string> = { ...filters, ...patch };
        Object.keys(next).forEach((k) => !next[k] && delete next[k]);

        router.get(route('sales.orders.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    const columns: Column<Order>[] = [
        {
            header: 'Order',
            primary: true,
            cell: (o) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{o.order_number}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {o.customer_name ?? o.customer_email ?? 'Guest'}
                    </p>
                </div>
            ),
        },
        { header: 'Status', cell: (o) => <StatusBadge value={o.status} /> },
        { header: 'Payment', cell: (o) => <StatusBadge value={o.payment_status} /> },
        { header: 'Items', align: 'right', cell: (o) => o.items_count, hideOnMobile: true },
        { header: 'Placed', cell: (o) => o.placed_at ?? '—', hideOnMobile: true },
        { header: 'Total', align: 'right', cell: (o) => money(o.total_cents) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <PageHeader title="Orders" description="Every order placed through the store." />

                <StatGrid>
                    <StatCard label="Total orders" value={stats.total} />
                    <StatCard label="Awaiting payment" value={stats.awaiting_payment} />
                    <StatCard label="Ready to fulfil" value={stats.to_fulfil} />
                    <StatCard label="Paid revenue" value={money(stats.revenue_cents)} />
                </StatGrid>

                <Card>
                    <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                        <SearchInput
                            value={filters.search ?? ''}
                            onChange={(search) => apply({ search })}
                            placeholder="Search order number, customer…"
                            busy={busy}
                            className="lg:max-w-sm lg:flex-1"
                        />

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
                            <Select value={filters.status || ANY} onValueChange={(v) => apply({ status: v === ANY ? '' : v })}>
                                <SelectTrigger className="lg:w-[150px]" aria-label="Order status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>Any status</SelectItem>
                                    {statuses.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={filters.payment_status || ANY} onValueChange={(v) => apply({ payment_status: v === ANY ? '' : v })}>
                                <SelectTrigger className="lg:w-[150px]" aria-label="Payment status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>Any payment</SelectItem>
                                    {paymentStatuses.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={filters.sort ?? '-created_at'} onValueChange={(sort) => apply({ sort })}>
                                <SelectTrigger className="lg:w-[170px]" aria-label="Sort"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-created_at">Newest first</SelectItem>
                                    <SelectItem value="created_at">Oldest first</SelectItem>
                                    <SelectItem value="-total_cents">Value high–low</SelectItem>
                                    <SelectItem value="total_cents">Value low–high</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="px-0">
                        <ResponsiveTable
                            columns={columns}
                            rows={rows}
                            rowKey={(o) => o.id}
                            onRowClick={(o) => router.visit(route('sales.orders.show', o.id))}
                            empty={
                                hasFilters ? (
                                    <EmptyState
                                        icon={SearchX}
                                        title="No orders match those filters"
                                        description="Try a different search term or clear the filters."
                                        action={
                                            <Button variant="outline" size="sm" onClick={() => router.get(route('sales.orders.index'))}>
                                                Clear filters
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <EmptyState
                                        icon={ShoppingCart}
                                        title="No orders yet"
                                        description="Orders placed in the storefront will appear here."
                                    />
                                )
                            }
                        />
                    </CardContent>
                </Card>

                {orders?.last_page > 1 && (
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Showing {orders.from}–{orders.to} of {orders.total}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!orders.prev_page_url}
                                onClick={() => orders.prev_page_url && router.get(orders.prev_page_url, {}, { preserveScroll: true })}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={!orders.next_page_url}
                                onClick={() => orders.next_page_url && router.get(orders.next_page_url, {}, { preserveScroll: true })}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
