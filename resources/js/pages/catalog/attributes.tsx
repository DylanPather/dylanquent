import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Layers,
    MoreHorizontal,
    Trash2,
    Edit2,
    Settings2,
    X,
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
    { title: 'Attributes', href: '/catalog/attributes' }
];

interface Attribute {
    id: number;
    name: string;
    type: string;
    values: string[] | null;
}

export default function Attributes({ attributes }: { attributes: Attribute[] }) {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingAttribute, setEditingAttribute] = React.useState<Attribute | null>(null);
    const [newValue, setNewValue] = React.useState('');

    const form = useForm({
        name: '',
        type: 'select',
        values: [] as string[],
    });

    const openCreateSheet = () => {
        setEditingAttribute(null);
        form.reset();
        setIsSheetOpen(true);
    };

    const openEditSheet = (attr: Attribute) => {
        setEditingAttribute(attr);
        form.setData({
            name: attr.name,
            type: attr.type,
            values: attr.values || [],
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAttribute) {
            form.put(route('catalog.attributes.update', editingAttribute.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        } else {
            form.post(route('catalog.attributes.store'), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this attribute?')) {
            form.delete(route('catalog.attributes.destroy', id));
        }
    };

    const addValue = () => {
        if (newValue.trim()) {
            form.setData('values', [...form.data.values, newValue.trim()]);
            setNewValue('');
        }
    };

    const removeValue = (index: number) => {
        const newValues = [...form.data.values];
        newValues.splice(index, 1);
        form.setData('values', newValues);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Attributes" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Product Attributes</h1>
                        <p className="text-sm text-muted-foreground">Define global variables like Size, Color, or Material for your products.</p>
                    </div>
                    <Button size="sm" onClick={openCreateSheet}>
                        <Plus className="mr-2 size-4" />
                        New Attribute
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {attributes.map((attr) => (
                        <Card key={attr.id} className="flex flex-col group h-full">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Layers className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{attr.name}</CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{attr.type}</CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditSheet(attr)}>
                                                <Edit2 className="mr-2 size-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(attr.id)}>
                                                <Trash2 className="mr-2 size-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Options</p>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values && attr.values.length > 0 ? (
                                            attr.values.map((v: string) => (
                                                <Badge key={v} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                                                    {v}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic opacity-50">Freeform text</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <button
                        onClick={openCreateSheet}
                        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-muted/50 transition-colors group"
                    >
                        <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Plus className="size-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">Add Attribute</p>
                            <p className="text-xs text-muted-foreground">Create global variable</p>
                        </div>
                    </button>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>{editingAttribute ? 'Edit Attribute' : 'New Attribute'}</SheetTitle>
                        <SheetDescription>
                            Configure global product variables and their valid options.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="attribute-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Definition</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="attr-name" className="text-xs font-bold uppercase tracking-wider">Attribute Label</Label>
                                        <Input
                                            id="attr-name"
                                            className="h-10 bg-background"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="e.g. Size, Material, color"
                                            required
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="attr-type" className="text-xs font-bold uppercase tracking-wider">Display Type</Label>
                                        <Select
                                            value={form.data.type}
                                            onValueChange={val => form.setData('type', val)}
                                        >
                                            <SelectTrigger id="attr-type" className="h-10 bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="select">Dropdown / List</SelectItem>
                                                <SelectItem value="color">Color Swatch</SelectItem>
                                                <SelectItem value="text">Text Input (No Options)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {form.data.type !== 'text' && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Options & Values</h4>
                                    <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                        <div className="flex gap-2">
                                            <Input
                                                value={newValue}
                                                className="h-10 bg-background"
                                                onChange={e => setNewValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addValue())}
                                                placeholder="Add option (e.g. XL, Cotton, #FF0000)..."
                                            />
                                            <Button type="button" size="icon" className="h-10 w-10" onClick={addValue}>
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                                            {form.data.values.map((v, i) => (
                                                <Badge key={i} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium">
                                                    {v}
                                                    <button type="button" onClick={() => removeValue(i)} className="hover:text-red-500 transition-colors">
                                                        <X className="size-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            {form.data.values.length === 0 && (
                                                <p className="text-[10px] text-muted-foreground italic uppercase font-bold tracking-wider">No options added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        <Button type="submit" form="attribute-form" className="w-full h-11" disabled={form.processing}>
                            {editingAttribute ? 'Update Attribute' : 'Save Attribute'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
