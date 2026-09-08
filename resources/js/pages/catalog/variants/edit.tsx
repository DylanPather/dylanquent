import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type VariantPayload = {
    id: number; product_id: number; name: string | null; sku: string; price: number | null; compare_at_price: number | null; track_inventory: boolean; stock_quantity: number; low_stock_threshold: number; is_active: boolean;
};
type ProductOpt = { id: number; name: string; sku: string };

export default function VariantEdit() {
    const { props } = usePage<{ variant: VariantPayload; products: ProductOpt[] }>();
    const variant = props.variant;
    const products = props.products ?? [];
    const { data, setData, put, processing, errors } = useForm({
        ...variant,
        redirect: (new URLSearchParams(window.location.search)).get('redirect') || undefined,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('catalog.variants.update', { variant: variant.id }));
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Catalog', href: '/catalog/products' }, { title: 'Variants', href: '/catalog/variants' }, { title: 'Edit', href: `/catalog/variants/${variant.id}/edit` }]}>
            <Head title={`Edit Variant ${variant.sku}`} />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-2xl md:p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Edit variant</h1>
                        <p className="text-sm text-muted-foreground">Update details and inventory.</p>
                    </div>
                    <Link href={route('catalog.variants.index')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="product">Product</Label>
                        <select id="product" className="h-10 rounded-md border px-3 text-sm" value={data.product_id as number} onChange={(e) => setData('product_id', Number(e.target.value))}>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                        <InputError message={errors.product_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name ?? ''} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Medium / Black" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} required />
                        <InputError message={errors.sku} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (optional)</Label>
                        <Input id="price" type="number" step="0.01" value={data.price ?? ''} onChange={(e) => setData('price', e.target.value === '' ? null : Number(e.target.value))} />
                        <InputError message={errors.price as string} />
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
                    <Button type="submit" disabled={processing}>Save</Button>
                    <Link href={route('catalog.variants.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

