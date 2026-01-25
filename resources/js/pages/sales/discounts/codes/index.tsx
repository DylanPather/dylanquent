import * as React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type Discount = { id: number; name: string; code: string; type: 'percent'|'fixed_amount'; value: number; is_active: boolean; starts_at?: string | null; ends_at?: string | null };

export default function DiscountCodesIndex({ discounts = { data: [] as Discount[] } }: { discounts: { data: Discount[] } }) {
    const items = discounts.data ?? [];
    const [openCreate, setOpenCreate] = React.useState(false);
    const [editing, setEditing] = React.useState<Discount | null>(null);
    const createForm = useForm({
        name: '', code: '', type: 'percent' as 'percent'|'fixed_amount', value: 10,
        min_order_value: '' as unknown as number | '', usage_limit: '' as unknown as number | '',
        starts_at: '', ends_at: '', is_active: true,
    });
    const editForm = useForm({
        id: 0, name: '', code: '', type: 'percent' as 'percent'|'fixed_amount', value: 10,
        min_order_value: '' as unknown as number | '', usage_limit: '' as unknown as number | '',
        starts_at: '', ends_at: '', is_active: true,
    });
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales/orders' }, { title: 'Discounts', href: '/sales/discounts/codes' }]}>
            <Head title="Discount Codes" />
            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Discount Codes</h1>
                    <p className="text-sm text-muted-foreground">Manage manually-applied discount codes.</p>
                </div>
                <Button onClick={() => setOpenCreate(true)}>New Discount</Button>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm">No discount codes</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Create a code to run promotions.</CardContent>
                    </Card>
                )}
                {items.map((d) => (
                    <Card key={d.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{d.name}</CardTitle>
                            <Badge variant={d.is_active ? 'secondary' : 'outline'}>{d.is_active ? 'Active' : 'Disabled'}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Code</span>
                                <span className="font-medium">{d.code}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium">{d.type === 'percent' ? `${d.value}%` : `R${(d.value / 100).toFixed(2)}`}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Window</span>
                                <span className="font-medium">{d.starts_at || '—'} → {d.ends_at || '—'}</span>
                            </div>
                            <div className="pt-2 text-right">
                                <button
                                    onClick={() => {
                                        setEditing(d);
                                        editForm.setData({
                                            id: d.id,
                                            name: d.name,
                                            code: d.code,
                                            type: d.type,
                                            value: d.value,
                                            min_order_value: (d as any).min_order_value ?? '' as any,
                                            usage_limit: (d as any).usage_limit ?? '' as any,
                                            starts_at: d.starts_at ?? '',
                                            ends_at: d.ends_at ?? '',
                                            is_active: d.is_active,
                                        });
                                    }}
                                    className="text-xs underline underline-offset-2"
                                >
                                    Edit
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Drawer */}
            <Sheet open={openCreate} onOpenChange={setOpenCreate}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>New Discount</SheetTitle>
                    </SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); createForm.post(route('sales.discounts.codes.store'), { onSuccess: () => { setOpenCreate(false); createForm.reset(); } }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                            <InputError message={createForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" value={createForm.data.code} onChange={(e) => createForm.setData('code', e.target.value.toUpperCase())} />
                            <InputError message={createForm.errors.code} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={createForm.data.type} onValueChange={(v: any) => createForm.setData('type', v)}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent">Percent</SelectItem>
                                    <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.type as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input id="value" type="number" value={createForm.data.value as number} onChange={(e) => createForm.setData('value', Number(e.target.value))} />
                            <InputError message={createForm.errors.value as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_order_value">Min order value (R)</Label>
                            <Input id="min_order_value" type="number" step="0.01" value={createForm.data.min_order_value as number | ''} onChange={(e) => createForm.setData('min_order_value', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={createForm.errors.min_order_value as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="usage_limit">Usage limit</Label>
                            <Input id="usage_limit" type="number" value={createForm.data.usage_limit as number | ''} onChange={(e) => createForm.setData('usage_limit', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={createForm.errors.usage_limit as string} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="starts_at">Starts at</Label>
                                <Input id="starts_at" type="date" value={createForm.data.starts_at as string} onChange={(e) => createForm.setData('starts_at', e.target.value)} />
                                <InputError message={createForm.errors.starts_at as string} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ends_at">Ends at</Label>
                                <Input id="ends_at" type="date" value={createForm.data.ends_at as string} onChange={(e) => createForm.setData('ends_at', e.target.value)} />
                                <InputError message={createForm.errors.ends_at as string} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="is_active" checked={!!createForm.data.is_active} onCheckedChange={(v: boolean) => createForm.setData('is_active', !!v)} />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={createForm.processing}>Create</Button>
                                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Edit Drawer */}
            <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Edit Discount</SheetTitle>
                    </SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); if (!editing) return; editForm.put(route('sales.discounts.codes.update', { discount: editing.id }), { onSuccess: () => setEditing(null) }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name_e">Name</Label>
                            <Input id="name_e" value={editForm.data.name as string} onChange={(e) => editForm.setData('name', e.target.value)} />
                            <InputError message={editForm.errors.name as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code_e">Code</Label>
                            <Input id="code_e" value={editForm.data.code as string} onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())} />
                            <InputError message={editForm.errors.code as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={editForm.data.type as any} onValueChange={(v: any) => editForm.setData('type', v)}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent">Percent</SelectItem>
                                    <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.type as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value_e">Value</Label>
                            <Input id="value_e" type="number" value={editForm.data.value as number} onChange={(e) => editForm.setData('value', Number(e.target.value))} />
                            <InputError message={editForm.errors.value as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_order_value_e">Min order value (R)</Label>
                            <Input id="min_order_value_e" type="number" step="0.01" value={editForm.data.min_order_value as number | ''} onChange={(e) => editForm.setData('min_order_value', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={editForm.errors.min_order_value as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="usage_limit_e">Usage limit</Label>
                            <Input id="usage_limit_e" type="number" value={editForm.data.usage_limit as number | ''} onChange={(e) => editForm.setData('usage_limit', e.target.value === '' ? ('' as any) : Number(e.target.value))} />
                            <InputError message={editForm.errors.usage_limit as string} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="starts_at_e">Starts at</Label>
                                <Input id="starts_at_e" type="date" value={editForm.data.starts_at as string} onChange={(e) => editForm.setData('starts_at', e.target.value)} />
                                <InputError message={editForm.errors.starts_at as string} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ends_at_e">Ends at</Label>
                                <Input id="ends_at_e" type="date" value={editForm.data.ends_at as string} onChange={(e) => editForm.setData('ends_at', e.target.value)} />
                                <InputError message={editForm.errors.ends_at as string} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="is_active_e" checked={!!editForm.data.is_active} onCheckedChange={(v: boolean) => editForm.setData('is_active', !!v)} />
                            <Label htmlFor="is_active_e">Active</Label>
                        </div>
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={editForm.processing}>Save</Button>
                                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
