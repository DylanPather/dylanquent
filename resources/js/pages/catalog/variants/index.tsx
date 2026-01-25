import * as React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    Filter,
    Package,
    Box,
    Edit2,
    Trash2,
    MoreHorizontal,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Variants', href: '/catalog/variants' }
];

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Variant {
    id: number;
    name: string | null;
    sku: string;
    price: number | null;
    stock_quantity: number;
    is_active: boolean;
    product: Product;
}

export default function VariantsIndex({ variants: variantsData, products }: { variants: { data: Variant[] }, products: Product[] }) {
    const variants = variantsData.data;
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingVariant, setEditingVariant] = React.useState<Variant | null>(null);

    const form = useForm({
        product_id: '',
        name: '',
        sku: '',
        price: '' as string | number,
        stock_quantity: 0,
        is_active: true as boolean,
    });

    const openCreateSheet = () => {
        setEditingVariant(null);
        form.reset();
        setIsSheetOpen(true);
    };

    const openEditSheet = (variant: Variant) => {
        setEditingVariant(variant);
        form.setData({
            product_id: variant.product.id.toString(),
            name: variant.name || '',
            sku: variant.sku,
            price: variant.price || '',
            stock_quantity: variant.stock_quantity,
            is_active: variant.is_active,
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingVariant) {
            form.put(route('catalog.variants.update', editingVariant.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        } else {
            form.post(route('catalog.variants.store'), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this variant?')) {
            form.delete(route('catalog.variants.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Variants" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Product Variants</h1>
                        <p className="text-sm text-muted-foreground">Manage individual stock keeping units (SKUs) and variations.</p>
                    </div>
                    <Button size="sm" onClick={openCreateSheet}>
                        <Plus className="mr-2 size-4" />
                        Add Variant
                    </Button>
                </div>

                <Card>
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search variants or SKUs..." className="pl-9 h-9 text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 size-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Variant Details</TableHead>
                                    <TableHead>Parent Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Inventory</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variants.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded">
                                                    <Package className="size-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{v.name || 'Default Variant'}</p>
                                                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-muted-foreground">
                                                        {v.sku}
                                                    </code>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Box className="size-3 text-muted-foreground" />
                                                <span className="text-xs font-medium">{v.product?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {v.price != null ? `ZAR ${v.price.toFixed(2)}` : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={`h-full ${v.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                        style={{ width: `${Math.min(v.stock_quantity, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{v.stock_quantity}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={v.is_active ? 'secondary' : 'outline'} className="text-[10px] font-bold uppercase tracking-wider">
                                                {v.is_active ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditSheet(v)}>
                                                        <Edit2 className="mr-2 size-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(v.id)}>
                                                        <Trash2 className="mr-2 size-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>{editingVariant ? 'Edit Variant' : 'New Variant'}</SheetTitle>
                        <SheetDescription>
                            Configure individual SKU details and stock levels.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="variant-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product Link</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="v-product" className="text-xs font-bold uppercase tracking-wider">Parent Product</Label>
                                        <Select
                                            value={form.data.product_id}
                                            onValueChange={val => form.setData('product_id', val)}
                                            disabled={!!editingVariant}
                                        >
                                            <SelectTrigger id="v-product" className="h-10 bg-background">
                                                <SelectValue placeholder="Select parent product..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.product_id && <p className="text-xs text-red-500">{form.errors.product_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & SKU</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="v-name" className="text-xs font-bold uppercase tracking-wider">Variant Name</Label>
                                        <Input
                                            id="v-name"
                                            className="h-10 bg-background"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="e.g. Small / Red"
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="v-sku" className="text-xs font-bold uppercase tracking-wider">SKU Code</Label>
                                        <Input
                                            id="v-sku"
                                            className="h-10 bg-background"
                                            value={form.data.sku}
                                            onChange={e => form.setData('sku', e.target.value)}
                                            placeholder="e.g. TSHIRT-RED-S"
                                            required
                                        />
                                        {form.errors.sku && <p className="text-xs text-red-500">{form.errors.sku}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Inventory & Pricing</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="v-price" className="text-xs font-bold uppercase tracking-wider">Price (ZAR)</Label>
                                            <Input
                                                id="v-price"
                                                type="number"
                                                step="0.01"
                                                className="h-10 bg-background"
                                                value={form.data.price}
                                                onChange={e => form.setData('price', e.target.value)}
                                                placeholder="Use parent price"
                                            />
                                            {form.errors.price && <p className="text-xs text-red-500">{form.errors.price}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="v-stock" className="text-xs font-bold uppercase tracking-wider">Stock Level</Label>
                                            <Input
                                                id="v-stock"
                                                type="number"
                                                className="h-10 bg-background"
                                                value={form.data.stock_quantity}
                                                onChange={e => form.setData('stock_quantity', parseInt(e.target.value) || 0)}
                                            />
                                            {form.errors.stock_quantity && <p className="text-xs text-red-500">{form.errors.stock_quantity}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="v-active"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="v-active" className="text-sm font-bold">Enabled Status</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Available for purchase on the storefront</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        <Button type="submit" form="variant-form" className="w-full h-11" disabled={form.processing}>
                            {editingVariant ? 'Update Variant' : 'Create Variant'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
