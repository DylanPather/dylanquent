import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type ProductPayload = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    currency: string;
    track_inventory: boolean;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
};

export default function ProductEdit() {
    const { props } = usePage();
    const product = props.product as ProductPayload;

    const { data, setData, put, processing, errors } = useForm<ProductPayload>({
        ...product,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('products.update', product.id));
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Products', href: '/products' }, { title: product.name, href: `/products/${product.id}/edit` }]}>
            <Head title={`Edit ${product.name}`} />

            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-3xl md:p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Edit product</h1>
                        <p className="text-sm text-muted-foreground">Update details, pricing and inventory.</p>
                    </div>
                    <Link href={route('products.index')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} required />
                        <InputError message={errors.slug} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} required />
                        <InputError message={errors.sku} />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" step="0.01" value={data.price} onChange={(e) => setData('price', Number(e.target.value))} required />
                        <InputError message={errors.price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="compare_at_price">Compare at</Label>
                        <Input id="compare_at_price" type="number" step="0.01" value={data.compare_at_price ?? ''} onChange={(e) => setData('compare_at_price', Number(e.target.value))} />
                        <InputError message={errors.compare_at_price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} />
                        <InputError message={errors.currency} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2 md:col-span-3">
                        <Checkbox id="track_inventory" checked={!!data.track_inventory} onCheckedChange={(v: boolean) => setData('track_inventory', !!v)} />
                        <Label htmlFor="track_inventory">Track inventory</Label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock_quantity">Stock quantity</Label>
                        <Input id="stock_quantity" type="number" value={data.stock_quantity} onChange={(e) => setData('stock_quantity', Number(e.target.value))} />
                        <InputError message={errors.stock_quantity} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="low_stock_threshold">Low stock threshold</Label>
                        <Input id="low_stock_threshold" type="number" value={data.low_stock_threshold} onChange={(e) => setData('low_stock_threshold', Number(e.target.value))} />
                        <InputError message={errors.low_stock_threshold} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="is_active" checked={!!data.is_active} onCheckedChange={(v: boolean) => setData('is_active', !!v)} />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Save changes</Button>
                    <Link href={route('products.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}


