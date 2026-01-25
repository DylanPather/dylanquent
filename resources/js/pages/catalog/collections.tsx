import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Blocks,
    ArrowUpRight,
    Calendar,
    ShoppingCart,
    Edit2,
    Trash2,
    MoreHorizontal,
    Upload,
} from 'lucide-react';
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
    { title: 'Collections', href: '/catalog/collections' }
];

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    products_count: number;
}

export default function Collections({ collections }: { collections: Collection[] }) {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingCollection, setEditingCollection] = React.useState<Collection | null>(null);

    const form = useForm({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true as boolean,
    });

    const openCreateSheet = () => {
        setEditingCollection(null);
        form.reset();
        setIsSheetOpen(true);
    };

    const openEditSheet = (collection: Collection) => {
        setEditingCollection(collection);
        form.setData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            image_url: collection.image_url || '',
            is_active: collection.is_active,
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCollection) {
            form.put(route('catalog.collections.update', editingCollection.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        } else {
            form.post(route('catalog.collections.store'), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            form.delete(route('catalog.collections.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collections" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
                        <p className="text-sm text-muted-foreground">Curate groups of products for seasonal drops or categories.</p>
                    </div>
                    <Button size="sm" onClick={openCreateSheet}>
                        <Plus className="mr-2 size-4" />
                        Add Collection
                    </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {collections.map((collection) => (
                        <Card key={collection.id} className="overflow-hidden flex flex-col group relative">
                            <div className="aspect-[16/9] w-full bg-muted relative">
                                {collection.image_url ? (
                                    <img src={collection.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                        <Blocks className="size-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge variant={collection.is_active ? 'secondary' : 'outline'}>
                                        {collection.is_active ? 'Active' : 'Draft'}
                                    </Badge>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 shadow-lg">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditSheet(collection)}>
                                                <Edit2 className="mr-2 size-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(collection.id)}>
                                                <Trash2 className="mr-2 size-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardContent className="p-4 flex-1">
                                <h3 className="text-lg font-bold truncate">{collection.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 h-8">
                                    {collection.description || 'No description provided.'}
                                </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-muted/50 mt-2">
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <ShoppingCart className="size-3" />
                                        {collection.products_count}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        <span>Jan 25</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8" onClick={() => openEditSheet(collection)}>
                                    Edit
                                    <ArrowUpRight className="ml-1 size-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>{editingCollection ? 'Edit Collection' : 'New Collection'}</SheetTitle>
                        <SheetDescription>
                            {editingCollection ? 'Update this collection\'s visual identity and details.' : 'Create a curated set of products for your store.'}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="collection-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-name" className="text-xs font-bold uppercase tracking-wider">Name</Label>
                                        <Input
                                            id="c-name"
                                            className="h-10 bg-background"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="e.g. Winter Drop 2026"
                                            required
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-slug" className="text-xs font-bold uppercase tracking-wider">Slug</Label>
                                        <Input
                                            id="c-slug"
                                            className="h-10 bg-background"
                                            value={form.data.slug}
                                            onChange={e => form.setData('slug', e.target.value)}
                                            placeholder="e.g. winter-drop-2026"
                                        />
                                        {form.errors.slug && <p className="text-xs text-red-500">{form.errors.slug}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visuals</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-image" className="text-xs font-bold uppercase tracking-wider">Banner Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="c-image"
                                                value={form.data.image_url}
                                                onChange={e => form.setData('image_url', e.target.value)}
                                                className="flex-1 h-10 bg-background"
                                                placeholder="https://..."
                                            />
                                            <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                                                <Upload className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {form.data.image_url && (
                                        <div className="aspect-[21/9] rounded-lg overflow-hidden border bg-muted/50">
                                            <img src={form.data.image_url} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Content</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="c-description" className="text-xs font-bold uppercase tracking-wider">Description</Label>
                                        <Textarea
                                            id="c-description"
                                            className="bg-background min-h-[120px] resize-none"
                                            value={form.data.description}
                                            onChange={e => form.setData('description', e.target.value)}
                                            rows={4}
                                            placeholder="Describe the theme or purpose of this collection..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="c-is_active"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="c-is_active" className="text-sm font-bold">Storefront Visibility</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Publish this collection to the main storefront</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        <Button type="submit" form="collection-form" className="w-full h-11" disabled={form.processing}>
                            {editingCollection ? 'Update Collection' : 'Create Collection'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
