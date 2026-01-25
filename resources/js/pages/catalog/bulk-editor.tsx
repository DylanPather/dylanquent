import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Save,
    Undo,
    ArrowLeft,
    Search,
    Shirt,
    Package,
    Copy,
    Download,
    MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Bulk Editor', href: '/catalog/bulk-editor' }
];

export default function BulkEditor({ products }: { products: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bulk Editor" />

            <div className="flex flex-col h-full bg-muted/20">
                {/* Fixed Toolbar */}
                <div className="sticky top-0 z-20 bg-background border-b p-4 md:px-8">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('products.index')}>
                                    <ArrowLeft className="size-4 mr-2" />
                                    Back to Products
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Bulk Catalog Editor</h1>
                                <p className="text-xs text-muted-foreground">Directly edit prices, stock, and SKUs in a spreadsheet-like view.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Undo className="mr-2 size-4" />
                                Revert Changes
                            </Button>
                            <Button size="sm">
                                <Save className="mr-2 size-4" />
                                Save & Sync
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Card className="w-full overflow-hidden">
                        <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input placeholder="Filter by product or SKU..." className="pl-9 h-9 text-sm" />
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 size-4" />
                                Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1000px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-40 text-xs font-bold uppercase tracking-wider">Type</TableHead>
                                        <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider">Name / Title</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider">SKU</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider">Price (ZAR)</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider">Inventory</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <React.Fragment key={product.id}>
                                            {/* Product Row */}
                                            <TableRow className="bg-muted/10">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Shirt className="size-4 text-primary" />
                                                        <span className="text-[10px] font-bold uppercase">Product</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input defaultValue={product.name} className="h-8 text-sm font-medium" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 group">
                                                        <Input defaultValue={product.sku} className="h-8 w-40 text-xs font-mono bg-muted" readOnly />
                                                        <Copy className="size-3 text-muted-foreground cursor-pointer" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="relative w-28">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">R</span>
                                                        <Input defaultValue={product.price_cents / 100} className="pl-5 h-8 text-sm" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input defaultValue={product.stock_quantity} className="w-20 h-8 text-sm" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="size-4" /></Button>
                                                </TableCell>
                                            </TableRow>

                                            {/* Variant Rows */}
                                            {product.variants?.map((variant: any) => (
                                                <TableRow key={`v-${variant.id}`}>
                                                    <TableCell className="pl-8">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="size-4 text-muted-foreground" />
                                                            <span className="text-[10px] font-medium uppercase text-muted-foreground">Variant</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input defaultValue={variant.name} className="h-8 text-xs italic" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input defaultValue={variant.sku} className="h-8 w-40 text-[10px] font-mono bg-muted" readOnly />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="relative w-28">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">R</span>
                                                            <Input defaultValue={variant.price_cents ? variant.price_cents / 100 : ''} className="pl-5 h-8 text-xs" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input defaultValue={variant.stock_quantity} className="w-20 h-8 text-xs" />
                                                    </TableCell>
                                                    <TableCell className="text-right"></TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
