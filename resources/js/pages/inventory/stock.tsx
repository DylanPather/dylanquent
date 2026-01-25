import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Package,
    Search,
    ArrowUpDown,
    Filter,
    Truck,
    AlertTriangle,
    Warehouse
} from 'lucide-react';
import * as React from 'react';

type VariantListItem = {
    id: number;
    name: string;
    sku: string;
    total_quantity: number;
    low_stock_threshold?: number;
    product: { id: number; name: string; sku: string };
};

export default function InventoryStock({ variants = { data: [] as VariantListItem[] } }: { variants: { data: VariantListItem[] } }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const items = variants.data ?? [];

    const filteredItems = items.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockCount = filteredItems.filter(v => v.total_quantity <= (v.low_stock_threshold || 5)).length;
    const outOfStockCount = filteredItems.filter(v => v.total_quantity <= 0).length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Stock Levels', href: '/inventory/stock' }]}>
            <Head title="Stock Levels" />

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Stock Tracking</h1>
                    <p className="text-sm text-muted-foreground">Monitor and manage inventory across all products and variants.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <ArrowUpDown className="mr-2 size-4" /> Export CSV
                    </Button>
                    <Button>
                        <Truck className="mr-2 size-4" /> Create Transfer
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 px-4 md:px-6 pb-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-0 shadow-sm bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total SKUs</CardTitle>
                        <Package className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredItems.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-sm bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Low Stock</CardTitle>
                        <AlertTriangle className="size-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-sm bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Out of Stock</CardTitle>
                        <Badge variant="destructive" className="animate-pulse size-2 p-0 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-sm bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Warehouses</CardTitle>
                        <Warehouse className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4 Active</div>
                    </CardContent>
                </Card>
            </div>

            <div className="px-4 md:px-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by product name, SKU..."
                            className="pl-9 h-11 rounded-xl bg-background border-0 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-11 rounded-xl px-4">
                        <Filter className="mr-2 size-4" /> Filters
                    </Button>
                </div>

                <div className="rounded-2xl border bg-background overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/40 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Variant / SKU</th>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Warehouse</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Available</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredItems.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{v.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{v.sku}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground">{v.product?.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-normal">Main Distribution</Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {v.total_quantity <= 0 ? (
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            ) : v.total_quantity <= (v.low_stock_threshold || 5) ? (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Low Stock</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">Optimal</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-base">{v.total_quantity}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="size-10 opacity-20" />
                                                <p>No inventory items found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
