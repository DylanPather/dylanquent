import { type Column, ConfirmDialog, EmptyState, PageHeader, ResponsiveTable, SearchInput, StatCard, StatGrid } from '@/components/admin';
import { ProductSheet, type EditableProduct } from '@/components/products/product-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, PackageSearch, Pencil, Plus, SearchX, Trash2 } from 'lucide-react';
import * as React from 'react';

interface Product extends EditableProduct {
    currency: string;
    low_stock_threshold: number;
    created_at: string;
    thumbnail_url: string | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Filters {
    search: string;
    status: string;
    stock_status: string;
    sort: string;
}

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Products', href: '/catalog/products' },
];

const money = (cents: number) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 });

// 'any' is Radix's stand-in for "no filter" — empty string is not a valid value.
const ANY = 'any';

export default function ProductsIndex() {
    const { products, stats, filters } = usePage().props as unknown as {
        products: Paginator<Product>;
        stats: { total: number; active: number; low_stock: number; out_of_stock: number; total_stock: number };
        filters: Filters;
    };

    const rows = products?.data ?? [];

    const [selected, setSelected] = React.useState<number[]>([]);
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Product | null>(null);
    const [deleting, setDeleting] = React.useState<Product | null>(null);
    const [bulkOpen, setBulkOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

    const hasFilters = !!(filters.search || filters.status || filters.stock_status);

    /** Inertia visit, preserving scroll — the page previously did a full reload. */
    const apply = (patch: Partial<Filters>) => {
        const next: Record<string, string> = {
            search: filters.search ?? '',
            status: filters.status ?? '',
            stock_status: filters.stock_status ?? '',
            sort: filters.sort ?? '-created_at',
            ...patch,
        };
        Object.keys(next).forEach((k) => !next[k] && delete next[k]);

        router.get(route('catalog.products.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    const openCreate = () => { setEditing(null); setSheetOpen(true); };
    const openEdit = (p: Product) => { setEditing(p); setSheetOpen(true); };

    const confirmDelete = () => {
        if (!deleting) return;
        router.delete(route('catalog.products.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    const confirmBulkDelete = () => {
        // One request, rather than a forEach firing N racing deletes.
        router.delete(route('catalog.products.bulk-destroy'), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
            onFinish: () => setBulkOpen(false),
        });
    };

    const allSelected = rows.length > 0 && selected.length === rows.length;

    const columns: Column<Product>[] = [
        {
            header: 'Select',
            hideOnMobile: true,
            className: 'w-10',
            cell: (p) => (
                <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={(v) =>
                        setSelected((s) => (v ? [...s, p.id] : s.filter((id) => id !== p.id)))
                    }
                    aria-label={`Select ${p.name}`}
                />
            ),
        },
        {
            header: 'Product',
            primary: true,
            cell: (p) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} alt="" className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <PackageSearch className="size-4 text-muted-foreground" aria-hidden />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                </div>
            ),
        },
        { header: 'Price', align: 'right', cell: (p) => money(p.price_cents) },
        {
            header: 'Stock',
            align: 'right',
            cell: (p) => {
                const low = p.low_stock_threshold > 0 && p.stock_quantity <= p.low_stock_threshold;
                return (
                    <span className={p.stock_quantity === 0 ? 'text-destructive' : low ? 'text-amber-600 dark:text-amber-500' : ''}>
                        {p.stock_quantity}
                    </span>
                );
            },
        },
        {
            header: 'Status',
            cell: (p) => (
                <Badge variant="secondary" className={p.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : ''}>
                    {p.is_active ? 'Active' : 'Draft'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            align: 'right',
            cell: (p) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="mr-2 size-4" /> Quick edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('catalog.products.edit', p.id)}>Full details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleting(p)} className="text-destructive">
                            <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <PageHeader
                    title="Products"
                    description="Everything in your catalog."
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" /> Add product
                        </Button>
                    }
                />

                <StatGrid>
                    <StatCard label="Total products" value={stats.total} />
                    <StatCard label="Active" value={stats.active} />
                    <StatCard label="Low stock" value={stats.low_stock} />
                    <StatCard label="Out of stock" value={stats.out_of_stock} />
                </StatGrid>

                <Card>
                    <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                        <SearchInput
                            value={filters.search ?? ''}
                            onChange={(search) => apply({ search })}
                            placeholder="Search name or SKU…"
                            busy={busy}
                            className="lg:max-w-sm lg:flex-1"
                        />

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
                            <Select value={filters.status || ANY} onValueChange={(v) => apply({ status: v === ANY ? '' : v })}>
                                <SelectTrigger className="lg:w-[130px]" aria-label="Status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>Any status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Draft</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.stock_status || ANY} onValueChange={(v) => apply({ stock_status: v === ANY ? '' : v })}>
                                <SelectTrigger className="lg:w-[150px]" aria-label="Stock"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>Any stock</SelectItem>
                                    <SelectItem value="in_stock">In stock</SelectItem>
                                    <SelectItem value="low_stock">Low stock</SelectItem>
                                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.sort ?? '-created_at'} onValueChange={(sort) => apply({ sort })}>
                                <SelectTrigger className="col-span-2 sm:col-span-1 lg:w-[170px]" aria-label="Sort"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-created_at">Newest first</SelectItem>
                                    <SelectItem value="created_at">Oldest first</SelectItem>
                                    <SelectItem value="name">Name A–Z</SelectItem>
                                    <SelectItem value="-name">Name Z–A</SelectItem>
                                    <SelectItem value="-price_cents">Price high–low</SelectItem>
                                    <SelectItem value="price_cents">Price low–high</SelectItem>
                                    <SelectItem value="stock_quantity">Stock low–high</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                        <p className="text-sm font-medium">
                            {selected.length} selected
                        </p>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
                            <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
                                <Trash2 className="mr-2 size-4" /> Delete
                            </Button>
                        </div>
                    </div>
                )}

                <Card>
                    <CardContent className="px-0">
                        {rows.length > 0 && (
                            <div className="hidden items-center gap-3 border-b px-4 pb-3 md:flex">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(v) => setSelected(v ? rows.map((p) => p.id) : [])}
                                    aria-label="Select all products on this page"
                                />
                                <span className="text-sm text-muted-foreground">Select all on this page</span>
                            </div>
                        )}

                        <ResponsiveTable
                            columns={columns}
                            rows={rows}
                            rowKey={(p) => p.id}
                            empty={
                                hasFilters ? (
                                    <EmptyState
                                        icon={SearchX}
                                        title="No products match those filters"
                                        description="Try a different search term or clear the filters."
                                        action={
                                            <Button variant="outline" size="sm" onClick={() => router.get(route('catalog.products.index'))}>
                                                Clear filters
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <EmptyState
                                        icon={PackageSearch}
                                        title="No products yet"
                                        description="Add your first product to start selling."
                                        action={<Button size="sm" onClick={openCreate}><Plus className="mr-2 size-4" /> Add product</Button>}
                                    />
                                )
                            }
                        />
                    </CardContent>
                </Card>

                {products?.last_page > 1 && (
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Showing {products.from}–{products.to} of {products.total}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!products.prev_page_url}
                                onClick={() => products.prev_page_url && router.get(products.prev_page_url, {}, { preserveScroll: true })}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={!products.next_page_url}
                                onClick={() => products.next_page_url && router.get(products.next_page_url, {}, { preserveScroll: true })}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ProductSheet open={sheetOpen} onOpenChange={setSheetOpen} product={editing} />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
                title="Delete this product?"
                description={<>“{deleting?.name}” will be removed permanently. This cannot be undone.</>}
                confirmLabel="Delete product"
                destructive
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title={`Delete ${selected.length} product${selected.length === 1 ? '' : 's'}?`}
                description="These products will be removed permanently. This cannot be undone."
                confirmLabel="Delete them"
                destructive
                onConfirm={confirmBulkDelete}
            />
        </AppLayout>
    );
}
