import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
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
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FolderTree,
    Tags,
    Trash2,
    Edit2,
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
    { title: 'Categories', href: '/catalog/categories' }
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    products_count: number;
    parent?: {
        id: number;
        name: string;
    } | null;
}

export default function Categories({ categories }: { categories: Category[] }) {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

    const form = useForm({
        name: '',
        slug: '',
        parent_id: '' as string,
        description: '',
        is_active: true as boolean,
    });

    const openCreateSheet = () => {
        setEditingCategory(null);
        form.reset();
        setIsSheetOpen(true);
    };

    const openEditSheet = (category: Category) => {
        setEditingCategory(category);
        form.setData({
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id?.toString() || '',
            description: category.description || '',
            is_active: category.is_active,
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(route('catalog.categories.update', editingCategory.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        } else {
            form.post(route('catalog.categories.store'), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            form.delete(route('catalog.categories.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                        <p className="text-sm text-muted-foreground">Organize your products into a hierarchical structure.</p>
                    </div>
                    <Button size="sm" onClick={openCreateSheet}>
                        <Plus className="mr-2 size-4" />
                        New Category
                    </Button>
                </div>

                <Card>
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search categories..." className="pl-9 h-9 text-sm" />
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
                                    <TableHead className="w-[300px]">Name</TableHead>
                                    <TableHead>Parent Category</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="text-muted-foreground">
                                                    {category.parent_id ? <Tags className="size-4" /> : <FolderTree className="size-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{category.name}</p>
                                                    <p className="text-xs text-muted-foreground">/{category.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {category.parent ? (
                                                <span className="text-sm text-muted-foreground">{category.parent.name}</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground opacity-50 italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{category.products_count}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={category.is_active ? 'secondary' : 'outline'} className="text-[10px] font-bold uppercase tracking-wider">
                                                {category.is_active ? 'Active' : 'Archived'}
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
                                                    <DropdownMenuItem onClick={() => openEditSheet(category)}>
                                                        <Edit2 className="mr-2 size-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
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
                        <SheetTitle>{editingCategory ? 'Edit Category' : 'New Category'}</SheetTitle>
                        <SheetDescription>
                            {editingCategory ? 'Update existing category details.' : 'Add a new category to your product organization.'}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="category-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">Name</Label>
                                        <Input
                                            id="name"
                                            className="h-10 bg-background"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="e.g. Outerwear"
                                            required
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider">Slug</Label>
                                        <Input
                                            id="slug"
                                            className="h-10 bg-background"
                                            value={form.data.slug}
                                            onChange={e => form.setData('slug', e.target.value)}
                                            placeholder="e.g. outerwear"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic leading-none">Leave empty to auto-generate from name.</p>
                                        {form.errors.slug && <p className="text-xs text-red-500">{form.errors.slug}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Organization</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="parent_id" className="text-xs font-bold uppercase tracking-wider">Parent Category</Label>
                                        <Select
                                            value={form.data.parent_id}
                                            onValueChange={val => form.setData('parent_id', val)}
                                        >
                                            <SelectTrigger id="parent_id" className="h-10 bg-background">
                                                <SelectValue placeholder="Select parent (Optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (Top Level)</SelectItem>
                                                {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Content</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">Description</Label>
                                        <Textarea
                                            id="description"
                                            className="bg-background min-h-[120px] resize-none"
                                            value={form.data.description}
                                            onChange={e => form.setData('description', e.target.value)}
                                            placeholder="Briefly describe this category for SEO and customers..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) => form.setData('is_active', !!checked)}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="is_active" className="text-sm font-bold">Active Status</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Visible in navigation and category lists</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        <Button type="submit" form="category-form" className="w-full h-11" disabled={form.processing}>
                            {editingCategory ? 'Update Category' : 'Create Category'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
