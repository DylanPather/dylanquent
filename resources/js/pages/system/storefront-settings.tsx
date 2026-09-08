import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Save,
    Layout,
    Image as ImageIcon,
    Upload,
    RefreshCcw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const breadcrumbs = [
    { title: 'System', href: '/dashboard' },
    { title: 'Storefront Settings', href: '/system/storefront' }
];

type Product = {
    id: number;
    name: string;
    sku: string;
    thumbnail_url: string | null;
};

export default function StorefrontSettings({
    settings,
    availableProducts
}: {
    settings: Record<string, any>;
    availableProducts: Product[];
}) {
    const { data, setData, post, processing, recentlySuccessful } = useForm(settings);
    const [uploading, setUploading] = React.useState<number | null>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        post(route('system.storefront.update'));
    };

    const handleImageUpload = async (index: number, file: File) => {
        setUploading(index);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(route('system.storefront.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newProducts = [...data.featured_products];
            newProducts[index].image = response.data.url;
            setData('featured_products', newProducts);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(null);
        }
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = availableProducts.find(p => p.id.toString() === productId);
        if (product) {
            const newProducts = [...data.featured_products];
            newProducts[index].name = product.name;
            newProducts[index].image = product.thumbnail_url || newProducts[index].image;
            newProducts[index].product_id = product.id;
            setData('featured_products', newProducts);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Storefront Settings" />

            <div className="flex flex-col h-full overflow-hidden">
                {/* Fixed Header */}
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-4 py-4 md:px-8 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Storefront Settings</h1>
                            <p className="text-sm text-muted-foreground">Manage the content and featured products of your public storefront.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 size-4" />
                                    View Store
                                </a>
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                size="sm"
                            >
                                {processing ? (
                                    <RefreshCcw className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 size-4" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="flex flex-col gap-6">
                        {recentlySuccessful && (
                            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                                <AlertTitle className="text-sm font-bold">Success</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Storefront settings have been updated successfully.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Hero Section</CardTitle>
                                    <CardDescription>Configure the main headline and description on the homepage.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="hero_title">Hero Title</Label>
                                        <Input
                                            id="hero_title"
                                            value={data.hero_title}
                                            onChange={e => setData('hero_title', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                                        <Input
                                            id="hero_subtitle"
                                            value={data.hero_subtitle}
                                            onChange={e => setData('hero_subtitle', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hero_description">Description</Label>
                                        <Textarea
                                            id="hero_description"
                                            rows={4}
                                            value={data.hero_description}
                                            onChange={e => setData('hero_description', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Storefront Configuration</CardTitle>
                                    <CardDescription>General storefront behavior settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="homepage_version">Homepage Design</Label>
                                        <Select
                                            value={data.homepage_version}
                                            onValueChange={val => setData('homepage_version', val)}
                                        >
                                            <SelectTrigger id="homepage_version">
                                                <SelectValue placeholder="Select a design..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="premium">Premium (Immersive)</SelectItem>
                                                <SelectItem value="classic">Classic (Standard)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">
                                            Switch between experimental and standard layouts.
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <AlertCircle className="size-4 text-amber-500" />
                                        <span>Draft changes are live upon saving.</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-bold">Featured Products</h2>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                                {data.featured_products?.map((product: any, index: number) => (
                                    <Card key={index} className="overflow-hidden">
                                        <div className="aspect-square relative bg-muted group">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                                    <ImageIcon className="size-10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-md text-xs font-bold shadow-lg flex items-center gap-2">
                                                    <Upload className="size-3" />
                                                    {uploading === index ? 'Uploading...' : 'Upload Image'}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold">Link Product</Label>
                                                <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                                    <SelectTrigger className="h-9 text-xs">
                                                        <SelectValue placeholder="Select a product..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableProducts.map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                                                                {p.name} ({p.sku})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold">Display Name</Label>
                                                <Input
                                                    value={product.name}
                                                    onChange={e => {
                                                        const newProducts = [...data.featured_products];
                                                        newProducts[index].name = e.target.value;
                                                        setData('featured_products', newProducts);
                                                    }}
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
