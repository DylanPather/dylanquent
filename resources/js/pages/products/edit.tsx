import * as React from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Upload, X, Star } from 'lucide-react';

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

type VariantItem = {
    id: number; name: string | null; sku: string; price: number | null; stock_quantity: number; is_active: boolean;
};

type ImageItem = {
    id: number;
    url: string;
    sort_order: number;
    is_primary: boolean;
};

export default function ProductEdit() {
    const { props } = usePage();
    const product = props.product as ProductPayload;
    const variants = (props.variants as VariantItem[]) || [];
    const images = (props.images as ImageItem[]) || [];
    const [imageList, setImageList] = React.useState<ImageItem[]>(images);
    const [uploading, setUploading] = React.useState(false);

    const [openCreateVar, setOpenCreateVar] = React.useState(false);
    const [editingVar, setEditingVar] = React.useState<VariantItem | null>(null);
    const createVar = useForm({
        product_id: product.id,
        name: '' as string,
        sku: '' as string,
        price: '' as unknown as number | '',
        track_inventory: true,
        stock_quantity: 0,
        low_stock_threshold: 0,
        is_active: true,
        redirect: 'product' as const,
    });
    const editVar = useForm({
        id: 0,
        product_id: product.id,
        name: '' as string,
        sku: '' as string,
        price: '' as unknown as number | '',
        track_inventory: true,
        stock_quantity: 0,
        low_stock_threshold: 0,
        is_active: true,
        redirect: 'product' as const,
    });

    const { data, setData, put, processing, errors } = useForm<ProductPayload>({
        ...product,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files) return;

        setUploading(true);
        let isPrimary = imageList.length === 0;

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('is_primary', isPrimary ? 'true' : 'false');

            await new Promise((resolve) => {
                router.post(route('catalog.products.images.store', product.id), formData as any, {
                    preserveState: true,
                    onFinish: resolve,
                });
            });

            isPrimary = false;
        }

        router.reload({ only: ['images'] });
        setUploading(false);
    };

    const handleSetPrimary = (imageId: number) => {
        router.put(route('catalog.images.update', imageId), { is_primary: true });
    };

    const handleDeleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(route('catalog.images.destroy', imageId));
        }
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('products.update', product.id));
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Products', href: '/products' }, { title: product.name, href: `/products/${product.id}/edit` }]}>
            <Head title={`Edit ${product.name}`} />

            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-6xl md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold tracking-tight">Edit product</h1>
                            <Badge variant={data.is_active ? 'secondary' : 'outline'}>
                                {data.is_active ? 'Active' : 'Draft'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Update product details, pricing, and inventory.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>Save changes</Button>
                        <Link href={route('products.index')}>
                            <Button variant="outline">Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Basic details</CardTitle>
                            <CardDescription>Keep the product information accurate and consistent.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
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
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Inventory</CardTitle>
                            <CardDescription>Track stock levels and low stock alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="track_inventory" checked={!!data.track_inventory} onCheckedChange={(v: boolean) => setData('track_inventory', !!v)} />
                                <Label htmlFor="track_inventory">Track inventory</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stock_quantity">Stock quantity</Label>
                                <Input
                                    id="stock_quantity"
                                    type="number"
                                    value={data.stock_quantity}
                                    onChange={(e) => setData('stock_quantity', Number(e.target.value))}
                                    disabled={!data.track_inventory}
                                />
                                <InputError message={errors.stock_quantity} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="low_stock_threshold">Low stock threshold</Label>
                                <Input
                                    id="low_stock_threshold"
                                    type="number"
                                    value={data.low_stock_threshold}
                                    onChange={(e) => setData('low_stock_threshold', Number(e.target.value))}
                                    disabled={!data.track_inventory}
                                />
                                <InputError message={errors.low_stock_threshold} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" checked={!!data.is_active} onCheckedChange={(v: boolean) => setData('is_active', !!v)} />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                            <CardDescription>Set your live price and optional compare-at price.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
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
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>Upload and manage product images. First image will be featured.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                                <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Drop images here or click to select</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {imageList.length > 0 && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {imageList.map((img) => (
                                        <div key={img.id} className="group relative overflow-hidden rounded-lg border">
                                            <img src={img.url} alt="Product" className="aspect-square w-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                {!img.is_primary && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleSetPrimary(img.id)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        Primary
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteImage(img.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {img.is_primary && (
                                                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                                                    <Star className="h-3 w-3 fill-white" />
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={processing}>Save changes</Button>
                    <Link href={route('products.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <div>
                            <CardTitle>Variants</CardTitle>
                            <CardDescription>Track sizes, colors, or other variations.</CardDescription>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => setOpenCreateVar(true)}>Add Variant</Button>
                    </CardHeader>
                    <CardContent>
                        {variants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No variants yet. Create one to start tracking sizes, colors, etc.</p>
                        ) : (
                            <div className="overflow-hidden rounded-md border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Name</th>
                                            <th className="px-3 py-2 font-medium">SKU</th>
                                            <th className="px-3 py-2 font-medium">Price</th>
                                            <th className="px-3 py-2 font-medium">Stock</th>
                                            <th className="px-3 py-2 font-medium">Status</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {variants.map((v) => (
                                            <tr key={v.id} className="hover:bg-muted/30">
                                                <td className="px-3 py-2">{v.name || '—'}</td>
                                                <td className="px-3 py-2">{v.sku}</td>
                                                <td className="px-3 py-2">{v.price != null ? `ZAR ${v.price.toFixed(2)}` : '—'}</td>
                                                <td className="px-3 py-2">{v.stock_quantity}</td>
                                                <td className="px-3 py-2">{v.is_active ? 'Active' : 'Disabled'}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingVar(v);
                                                            editVar.setData({
                                                                id: v.id,
                                                                product_id: product.id,
                                                                name: v.name ?? '',
                                                                sku: v.sku,
                                                                price: v.price ?? ('' as any),
                                                                track_inventory: true,
                                                                stock_quantity: v.stock_quantity,
                                                                low_stock_threshold: 0,
                                                                is_active: v.is_active,
                                                                redirect: 'product',
                                                            });
                                                        }}
                                                        className="text-xs underline underline-offset-2"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>

            {/* Create Variant Drawer */}
            <Sheet open={openCreateVar} onOpenChange={setOpenCreateVar}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>New Variant</SheetTitle>
                    </SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); createVar.post(route('catalog.variants.store'), { onSuccess: () => { setOpenCreateVar(false); createVar.reset('name','sku','price','stock_quantity','low_stock_threshold'); } }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="vname">Name</Label>
                            <Input id="vname" value={createVar.data.name} onChange={(e) => createVar.setData('name', e.target.value)} placeholder="e.g. Medium / Black" />
                            <InputError message={createVar.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vsku">SKU</Label>
                            <Input id="vsku" value={createVar.data.sku} onChange={(e) => createVar.setData('sku', e.target.value)} required />
                            <InputError message={createVar.errors.sku} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vprice">Price (optional)</Label>
                            <Input id="vprice" type="number" step="0.01" value={createVar.data.price as number | ''} onChange={(e) => createVar.setData('price', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={createVar.errors.price as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vstock">Stock quantity</Label>
                            <Input id="vstock" type="number" value={createVar.data.stock_quantity} onChange={(e) => createVar.setData('stock_quantity', Number(e.target.value))} />
                            <InputError message={createVar.errors.stock_quantity} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="vis_active" checked={!!createVar.data.is_active} onCheckedChange={(v: boolean) => createVar.setData('is_active', !!v)} />
                            <Label htmlFor="vis_active">Active</Label>
                        </div>
                        <input type="hidden" name="product_id" value={createVar.data.product_id} />
                        <input type="hidden" name="redirect" value="product" />
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={createVar.processing}>Create</Button>
                                <Button type="button" variant="outline" onClick={() => setOpenCreateVar(false)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Edit Variant Drawer */}
            <Sheet open={!!editingVar} onOpenChange={(o) => !o && setEditingVar(null)}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Edit Variant</SheetTitle>
                    </SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); if (!editingVar) return; editVar.put(route('catalog.variants.update', { variant: editingVar.id }), { onSuccess: () => setEditingVar(null) }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="vname_e">Name</Label>
                            <Input id="vname_e" value={editVar.data.name as string} onChange={(e) => editVar.setData('name', e.target.value)} />
                            <InputError message={(editVar as any).errors?.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vsku_e">SKU</Label>
                            <Input id="vsku_e" value={editVar.data.sku as string} onChange={(e) => editVar.setData('sku', e.target.value)} required />
                            <InputError message={(editVar as any).errors?.sku} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vprice_e">Price (optional)</Label>
                            <Input id="vprice_e" type="number" step="0.01" value={editVar.data.price as number | ''} onChange={(e) => editVar.setData('price', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={(editVar as any).errors?.price} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vstock_e">Stock quantity</Label>
                            <Input id="vstock_e" type="number" value={editVar.data.stock_quantity as number} onChange={(e) => editVar.setData('stock_quantity', Number(e.target.value))} />
                            <InputError message={(editVar as any).errors?.stock_quantity} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="vis_active_e" checked={!!editVar.data.is_active} onCheckedChange={(v: boolean) => editVar.setData('is_active', !!v)} />
                            <Label htmlFor="vis_active_e">Active</Label>
                        </div>
                        <input type="hidden" name="redirect" value="product" />
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={editVar.processing}>Save</Button>
                                <Button type="button" variant="outline" onClick={() => setEditingVar(null)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
