import { type Column, DataCard, EmptyState, ResponsiveTable } from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { AlertTriangle, PackageSearch, ReceiptText, ShoppingCart } from 'lucide-react';

const money = (v: number) =>
    'R' + v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ----------------------------- Top products ----------------------------- */

export interface TopProduct { sku: string; name: string; category: string; price: number; sold: number }

export function TopProducts({ products }: { products: TopProduct[] }) {
    const columns: Column<TopProduct>[] = [
        {
            header: 'Product',
            primary: true,
            cell: (p) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                </div>
            ),
        },
        { header: 'Sold', align: 'right', cell: (p) => p.sold },
        { header: 'Price', align: 'right', cell: (p) => money(p.price) },
    ];

    return (
        <DataCard
            title="Top products"
            description="Best sellers in the selected period"
            action={
                <Link href="/analytics/products" className="text-sm text-muted-foreground hover:text-foreground">
                    View all
                </Link>
            }
            flush
        >
            <ResponsiveTable
                columns={columns}
                rows={products}
                rowKey={(p) => p.sku}
                empty={
                    <EmptyState
                        icon={PackageSearch}
                        title="No sales yet"
                        description="Once orders are paid, your best sellers appear here."
                    />
                }
            />
        </DataCard>
    );
}

/* ----------------------------- Recent orders ---------------------------- */

export interface RecentOrder { id: string; customer: string; items: number; total: number; status: string; date: string }

const STATUS_TONE: Record<string, string> = {
    Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    Shipped: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    Delivered: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
    Refunded: 'bg-muted text-muted-foreground',
};

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
    const columns: Column<RecentOrder>[] = [
        {
            header: 'Order',
            primary: true,
            cell: (o) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{o.id}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.customer}</p>
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (o) => (
                <Badge variant="secondary" className={STATUS_TONE[o.status] ?? ''}>
                    {o.status}
                </Badge>
            ),
        },
        { header: 'Date', cell: (o) => o.date, hideOnMobile: true },
        { header: 'Total', align: 'right', cell: (o) => money(o.total) },
    ];

    return (
        <DataCard
            title="Recent orders"
            description="Latest activity across the store"
            action={
                <Link href="/sales/orders" className="text-sm text-muted-foreground hover:text-foreground">
                    View all
                </Link>
            }
            flush
        >
            <ResponsiveTable
                columns={columns}
                rows={orders}
                rowKey={(o) => o.id}
                empty={
                    <EmptyState
                        icon={ShoppingCart}
                        title="No orders yet"
                        description="New orders will show up here as they come in."
                    />
                }
            />
        </DataCard>
    );
}

/* ------------------------------- Low stock ------------------------------ */

export interface LowStockItem { sku: string; name: string; stock: number }

export function LowStock({ items }: { items: LowStockItem[] }) {
    return (
        <DataCard
            title="Low stock"
            description="At or below the reorder threshold"
            action={
                <Link href="/inventory/stock" className="text-sm text-muted-foreground hover:text-foreground">
                    Manage
                </Link>
            }
        >
            {items.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="Stock levels are healthy" description="Nothing needs reordering." />
            ) : (
                <ul className="space-y-3">
                    {items.map((item) => (
                        <li key={item.sku} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{item.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{item.sku}</p>
                            </div>
                            <Badge
                                variant="secondary"
                                className={
                                    item.stock === 0
                                        ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                }
                            >
                                {item.stock === 0 ? 'Sold out' : `${item.stock} left`}
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}
        </DataCard>
    );
}

/* ----------------------------- Quick actions ---------------------------- */

// Every href here is a route that exists; the previous list had two 404s.
const ACTIONS = [
    { label: 'Point of Sale', href: '/sales/pos' },
    { label: 'Add product', href: '/catalog/products/create' },
    { label: 'Discount codes', href: '/sales/discounts/codes' },
    { label: 'Stock levels', href: '/inventory/stock' },
];

export function QuickActions() {
    return (
        <DataCard title="Quick actions" description="Jump straight to a task">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ACTIONS.map((a) => (
                    <Link
                        key={a.href}
                        href={a.href}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <ReceiptText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="truncate">{a.label}</span>
                    </Link>
                ))}
            </div>
        </DataCard>
    );
}
