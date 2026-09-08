import * as React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type Warehouse = { id: number; name: string; code: string; is_active: boolean; created_at?: string | null };

export default function Warehouses({ warehouses = [] as Warehouse[] }: { warehouses: Warehouse[] }) {
    const [openCreate, setOpenCreate] = React.useState(false);
    const [editing, setEditing] = React.useState<Warehouse | null>(null);

    const createForm = useForm({ name: '', code: '', is_active: true as boolean });
    const editForm = useForm({ id: 0, name: '', code: '', is_active: true as boolean });

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(route('inventory.warehouses.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset('name', 'code');
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editing) return;
        editForm.put(route('inventory.warehouses.update', { warehouse: editing.id }), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Warehouses', href: '/inventory/warehouses' }]}>
            <Head title="Warehouses" />

            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Warehouses</h1>
                    <p className="text-sm text-muted-foreground">Locations that hold inventory.</p>
                </div>
                <Button onClick={() => setOpenCreate(true)}>New Warehouse</Button>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm">No warehouses yet</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Add a warehouse to start tracking inventory by location.</CardContent>
                    </Card>
                )}
                {warehouses.map((w) => (
                    <Card key={w.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{w.name}</CardTitle>
                            <Badge variant={w.is_active ? 'secondary' : 'outline'}>{w.is_active ? 'Active' : 'Disabled'}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Code</span>
                                <span className="font-medium">{w.code}</span>
                            </div>
                            <div className="pt-2 text-right">
                                <button
                                    onClick={() => {
                                        setEditing(w);
                                        editForm.setData({ id: w.id, name: w.name, code: w.code, is_active: w.is_active });
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
                        <SheetTitle>New Warehouse</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submitCreate} className="flex flex-1 flex-col gap-4 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} required />
                            <InputError message={createForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" value={createForm.data.code} onChange={(e) => createForm.setData('code', e.target.value.toUpperCase())} required />
                            <InputError message={createForm.errors.code} />
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
                        <SheetTitle>Edit Warehouse</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="flex flex-1 flex-col gap-4 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name_e">Name</Label>
                            <Input id="name_e" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code_e">Code</Label>
                            <Input id="code_e" value={editForm.data.code} onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())} required />
                            <InputError message={editForm.errors.code} />
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
