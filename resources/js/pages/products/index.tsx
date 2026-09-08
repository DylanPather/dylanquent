import * as React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Shirt,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Eye,
    EyeOff,
    Download,
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
    { title: 'Catalog', href: '/products' },
    { title: 'Products', href: '/products' }
];

interface Product {
    id: number;
    name: string;
    sku: string;
    slug: string;
    price_cents: number;
    currency: string;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
    created_at: string;
}

interface PageProps {
    products: {
        data: Product[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    stats: {
        total: number;
        active: number;
        low_stock: number;
        out_of_stock: number;
        total_stock: number;
    };
    filters: {
        search: string;
        status: string;
        stock_status: string;
        sort: string;
    };
}

export default function ProductsIndex() {
    const { products: productsData, stats, filters } = usePage().props as any as PageProps;
    const products = productsData?.data || [];
    const meta = productsData?.meta || {};

    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
    const [showFilters, setShowFilters] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState(filters.search || '');
    const [statusFilter, setStatusFilter] = React.useState(filters.status || '');
    const [stockFilter, setStockFilter] = React.useState(filters.stock_status || '');
    const [sortBy, setSortBy] = React.useState(filters.sort || '-created_at');

    const form = useForm({
        name: '',
        slug: '',
        sku: '',
        price: '' as string | number,
        stock_quantity: 0,
        is_active: true as boolean,
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (stockFilter) params.append('stock_status', stockFilter);
        if (sortBy) params.append('sort', sortBy);

        window.location.href = `/products?${params.toString()}`;
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setStockFilter('');
        setSortBy('-created_at');
        window.location.href = '/products';
    };

    const handleSort = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        const newDirection = currentSort === field && !sortBy.startsWith('-') ? '-' : '';
        setSortBy(newDirection + field);

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (stockFilter) params.append('stock_status', stockFilter);
        params.append('sort', newDirection + field);

        window.location.href = `/products?${params.toString()}`;
    };

    const getSortIcon = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        if (currentSort !== field) return null;
        return sortBy.startsWith('-') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />;
    };

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
            price: product.price_cents / 100,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active,
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

    const handleBulkDelete = () => {
        if (selectedProducts.length === 0) return;
        if (!confirm(`Delete ${selectedProducts.length} product(s)?`)) return;

        selectedProducts.forEach(id => {
            form.delete(route('products.destroy', id));
        });
        setSelectedProducts([]);
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const getStockStatus = (product: Product) => {
        if (product.stock_quantity === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-700', badge: 'destructive' };
        if (product.stock_quantity <= product.low_stock_threshold) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700', badge: 'secondary' };
        return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700', badge: 'secondary' };
    };

    const hasActiveFilters = searchQuery || statusFilter || stockFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Products</h1>
                        <p className="text-sm text-muted-foreground">Manage your product catalog and inventory</p>
                    </div>
                    <Button onClick={openCreateSheet} className="gap-2 h-11">
                        <Plus className="w-5 h-5" />
                        Create Product
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {[
                        { label: 'Total Products', value: stats.total, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Low Stock', value: stats.low_stock, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Out of Stock', value: stats.out_of_stock, color: 'bg-red-50 text-red-700' },
                        { label: 'Total Stock', value: stats.total_stock, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters & Search */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, SKU, or slug..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10"
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                            <Button onClick={applyFilters} variant="default" className="h-10">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="h-10">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-primary rounded-full" />}
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Stock Level</Label>
                                    <Select value={stockFilter} onValueChange={setStockFilter}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All stock levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All stock levels</SelectItem>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="low_stock">Low Stock</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2 items-end">
                                    <Button onClick={applyFilters} className="flex-1 h-10">Apply Filters</Button>
                                    {hasActiveFilters && (
                                        <Button onClick={resetFilters} variant="outline" className="flex-1 h-10">Reset</Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    {selectedProducts.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                    {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                </span>
                            </div>
                            <Button
                                onClick={handleBulkDelete}
                                variant="destructive"
                                size="sm"
                                className="h-8"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete All
                            </Button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={products.length > 0 && selectedProducts.length === products.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Product {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            SKU {getSortIcon('sku')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('price_cents')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Price {getSortIcon('price_cents')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('stock_quantity')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Stock {getSortIcon('stock_quantity')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Shirt className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-sm font-medium text-muted-foreground">No products found</p>
                                                <p className="text-xs text-muted-foreground">Try adjusting your filters or create a new product</p>
                                                <Button onClick={openCreateSheet} variant="outline" size="sm" className="mt-2">
                                                    Create Product
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedProducts.includes(product.id)}
                                                    onCheckedChange={() => toggleSelect(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                        <Shirt className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold truncate">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">/{product.slug}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono font-bold">
                                                    {product.sku}
                                                </code>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-sm font-bold">
                                                    {product.currency} {(product.price_cents / 100).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold">{product.stock_quantity}</div>
                                                    <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${product.stock_quantity > product.low_stock_threshold ? 'bg-emerald-500' : product.stock_quantity > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min((product.stock_quantity / 100) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="flex gap-1 flex-wrap">
                                                    <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                                        {product.is_active ? 'Active' : 'Draft'}
                                                    </Badge>
                                                    {product.stock_quantity === 0 && (
                                                        <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                                                    )}
                                                    {product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold && (
                                                        <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openQuickEditSheet(product)}>
                                                            <Edit2 className="w-4 h-4 mr-2" /> Quick Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('products.edit', { product: product.id })}>
                                                                <Edit2 className="w-4 h-4 mr-2" /> Full Editor
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="border-t p-4 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing {meta.from?.toLocaleString()} to {meta.to?.toLocaleString()} of {meta.total?.toLocaleString()} products
                            </p>
                            <div className="flex gap-2">
                                <Link href={route('products.index', { page: Math.max(1, meta.current_page - 1), ...filters })}>
                                    <Button variant="outline" size="sm" disabled={meta.current_page === 1}>Previous</Button>
                                </Link>
                                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                                    <Link key={page} href={route('products.index', { page, ...filters })}>
                                        <Button
                                            variant={page === meta.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            className="min-w-10"
                                        >
                                            {page}
                                        </Button>
                                    </Link>
                                ))}
                                <Link href={route('products.index', { page: Math.min(meta.last_page, meta.current_page + 1), ...filters })}>
                                    <Button variant="outline" size="sm" disabled={meta.current_page === meta.last_page}>Next</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>{editingProduct ? 'Quick Edit Product' : 'Create New Product'}</SheetTitle>
                        <SheetDescription>
                            {editingProduct ? 'Update essential product details quickly.' : 'Set up the basics for a new product.'}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase">Product Name</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="Basic Essential Tee"
                                    required
                                    className="h-10"
                                />
                                {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase">SKU</Label>
                                    <Input
                                        value={form.data.sku}
                                        onChange={e => form.setData('sku', e.target.value)}
                                        placeholder="TEE-BSC-WHT"
                                        required
                                        className="h-10"
                                    />
                                    {form.errors.sku && <p className="text-xs text-red-500">{form.errors.sku}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase">Slug</Label>
                                    <Input
                                        value={form.data.slug}
                                        onChange={e => form.setData('slug', e.target.value)}
                                        placeholder="basic-tee"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase">Price (ZAR)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={form.data.price}
                                        onChange={e => form.setData('price', e.target.value)}
                                        placeholder="499.00"
                                        required
                                        className="h-10"
                                    />
                                    {form.errors.price && <p className="text-xs text-red-500">{form.errors.price}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase">Stock</Label>
                                    <Input
                                        type="number"
                                        value={form.data.stock_quantity}
                                        onChange={e => form.setData('stock_quantity', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                                <Checkbox
                                    id="p-active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                />
                                <Label htmlFor="p-active" className="text-sm font-bold cursor-pointer flex-1 m-0">
                                    Active Status
                                    <p className="text-xs text-muted-foreground font-normal">Visible to customers</p>
                                </Label>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background">
                        {editingProduct ? (
                            <div className="flex gap-2 w-full">
                                <Button type="submit" form="product-form" className="flex-1 h-11" disabled={form.processing}>
                                    Save Changes
                                </Button>
                                <Link href={route('products.edit', { product: editingProduct.id })} className="w-11">
                                    <Button variant="outline" className="h-11 w-11 p-0">
                                        →
                                    </Button>
                                </Link>
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
