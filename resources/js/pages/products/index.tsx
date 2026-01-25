import * as React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Shirt,
    ArrowUpRight,
    Edit2,
    Trash2,
    LayoutGrid,
    List,
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Products', href: '/catalog/products' }
];

interface Product {
    id: number;
    name: string;
    sku: string;
    slug: string;
    price_cents: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

export default function Index({ products: productsData, categories }: { products: { data: Product[] }, categories: Category[] }) {
    const products = productsData.data;
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

    const form = useForm({
        name: '',
        slug: '',
        sku: '',
        description: '',
        price: '' as string | number,
        stock_quantity: 0,
        is_active: true as boolean,
        currency: 'ZAR',
    });

    const openCreateSheet = () => {
        setEditingProduct(null);
        form.reset();
        setIsSheetOpen(true);
    };

    const openQuickEditSheet = (product: Product) => {
        setEditingProduct(product);
        form.setData({
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: '', // We don't have description in index, maybe add it later
            price: product.price_cents / 100,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active,
            currency: product.currency,
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            form.put(route('products.update', editingProduct.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        } else {
            form.post(route('products.store'), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            form.delete(route('products.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                        <p className="text-sm text-muted-foreground">Manage your product catalog, inventory, and variants.</p>
                    </div>
                    <Button size="sm" onClick={openCreateSheet}>
                        <Plus className="mr-2 size-4" />
                        Create Product
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Active Products', value: '42', sub: '+12% from last month', icon: Shirt, color: 'text-primary' },
                        { label: 'Total In-Stock', value: '1,284', sub: 'Across all variations', icon: Shirt, color: 'text-blue-500' },
                        { label: 'Low Stock Alerts', value: '5', sub: 'Needs attention', icon: Shirt, color: 'text-amber-500' },
                        { label: 'Out of Stock', value: '2', sub: 'Currently unlisted', icon: Shirt, color: 'text-red-500' },
                    ].map((s, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
                                    <h4 className="text-xl font-bold">{s.value}</h4>
                                    <span className="text-[10px] text-muted-foreground">{s.sub}</span>
                                </div>
                                <div className={`${s.color} bg-muted p-2 rounded-lg`}>
                                    <s.icon className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Filter products or SKUs..." className="pl-9 h-9 text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="border rounded-lg p-0.5 flex items-center bg-muted/50 mr-2">
                                <Button variant="secondary" size="sm" className="h-7 w-7 p-0 shadow-sm"><LayoutGrid className="size-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><List className="size-4" /></Button>
                            </div>
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
                                    <TableHead className="w-[350px]">Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                    <Shirt className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground leading-none mt-1">/{product.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-bold">
                                                {product.sku}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {product.currency} {(product.price_cents / 100).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-bold">
                                                    <span>{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                                                    <span>{product.stock_quantity}</span>
                                                </div>
                                                <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${product.stock_quantity > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${Math.min(product.stock_quantity, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.is_active ? 'secondary' : 'outline'} className="text-[10px] font-bold uppercase tracking-wider">
                                                {product.is_active ? 'Active' : 'Draft'}
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
                                                    <DropdownMenuItem onClick={() => openQuickEditSheet(product)}>
                                                        <Edit2 className="mr-2 size-4" /> Quick Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('products.edit', { product: product.id })}>
                                                            <Shirt className="mr-2 size-4" /> Manage Full
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
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
                        <SheetTitle>{editingProduct ? 'Quick Edit Product' : 'Create New Product'}</SheetTitle>
                        <SheetDescription>
                            {editingProduct ? 'Update essential product details quickly.' : 'Set up the basics for a new product.'}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">General Information</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="p-name" className="text-xs font-bold uppercase tracking-wider">Product Name</Label>
                                        <Input
                                            id="p-name"
                                            className="h-10 bg-background"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="Basic Essential Tee"
                                            required
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="p-sku" className="text-xs font-bold uppercase tracking-wider">SKU</Label>
                                            <Input
                                                id="p-sku"
                                                className="h-10 bg-background"
                                                value={form.data.sku}
                                                onChange={e => form.setData('sku', e.target.value)}
                                                placeholder="TEE-BSC-WHT"
                                                required
                                            />
                                            {form.errors.sku && <p className="text-xs text-red-500">{form.errors.sku}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="p-slug" className="text-xs font-bold uppercase tracking-wider">Slug</Label>
                                            <Input
                                                id="p-slug"
                                                className="h-10 bg-background"
                                                value={form.data.slug}
                                                onChange={e => form.setData('slug', e.target.value)}
                                                placeholder="basic-tee"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Inventory & Pricing</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="p-price" className="text-xs font-bold uppercase tracking-wider">Price (ZAR)</Label>
                                            <Input
                                                id="p-price"
                                                type="number"
                                                step="0.01"
                                                className="h-10 bg-background"
                                                value={form.data.price}
                                                onChange={e => form.setData('price', e.target.value)}
                                                placeholder="499.00"
                                                required
                                            />
                                            {form.errors.price && <p className="text-xs text-red-500">{form.errors.price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="p-stock" className="text-xs font-bold uppercase tracking-wider">Available Stock</Label>
                                            <Input
                                                id="p-stock"
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
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Publishing</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="p-active"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="p-active" className="text-sm font-bold">Active Status</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Visible to customers on the storefront</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        {editingProduct ? (
                            <div className="flex gap-2 w-full">
                                <Button type="submit" form="product-form" className="flex-1 h-11" disabled={form.processing}>
                                    Save Changes
                                </Button>
                                <Button variant="outline" asChild className="h-11 w-11 p-0">
                                    <Link href={route('products.edit', { product: editingProduct.id })}>
                                        <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Button type="submit" form="product-form" className="w-full h-11" disabled={form.processing}>
                                Create Product
                            </Button>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
