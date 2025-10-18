import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus } from 'lucide-react';

type ProductListItem = {
    id: number;
    name: string;
    sku: string;
    slug: string;
    price_cents: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: string | null;
};

export default function ProductsIndex() {
    const { props } = usePage<{ products: { data: ProductListItem[] } }>();
    const products = props.products?.data ?? [];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Products', href: '/products' }]}>
            <Head title="Products" />

            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Products</h1>
                    <p className="text-sm text-muted-foreground">Manage pricing, inventory, and discounts.</p>
                </div>
                <Link href={route('products.create')}>
                    <Button>
                        <Plus className="mr-2 size-4" /> New Product
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                    <Card key={p.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{p.name}</CardTitle>
                            <Badge variant={p.is_active ? 'secondary' : 'outline'}>{p.is_active ? 'Active' : 'Draft'}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">SKU</span>
                                <span className="font-medium">{p.sku}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-medium">{p.currency} {(p.price_cents / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Stock</span>
                                <span className="font-medium">{p.stock_quantity}</span>
                            </div>
                            <div className="pt-2">
                                <Link href={route('products.edit', p.id)} className="inline-flex items-center text-sm underline underline-offset-4">
                                    <Package className="mr-2 size-4" /> Manage
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}


