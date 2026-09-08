import * as React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';

type PO = { id: number; po_number: string; supplier_name: string; status: string; currency: string; expected_at?: string | null; notes?: string | null };
type POItem = { id: number; product_variant_id: number; quantity: number; unit_cost: number; total: number; sku?: string; name?: string | null };
type VariantOpt = { id: number; sku: string; label: string };
type WarehouseOpt = { id: number; name: string; code: string };

export default function POEdit() {
    const { props } = usePage<{ po: PO; items: POItem[]; variants: VariantOpt[]; warehouses: WarehouseOpt[] }>();
    const po = props.po;
    const items = props.items || [];
    const variants = props.variants || [];
    const warehouses = props.warehouses || [];
    const { data, setData, put, processing, errors } = useForm({ ...po });
    const [openAddItem, setOpenAddItem] = React.useState(false);
    const [openReceive, setOpenReceive] = React.useState(false);
    const addItem = useForm({ product_variant_id: variants[0]?.id || ('' as any), quantity: 1, unit_cost: 0 });
    const receiveForm = useForm({ warehouse_id: warehouses[0]?.id || ('' as any) });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('inventory.pos.update', { purchase_order: po.id }));
    }
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Purchase Orders', href: '/inventory/pos' }, { title: po.po_number, href: `/inventory/pos/${po.id}/edit` }]}>
            <Head title={`PO ${po.po_number}`} />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-3xl md:p-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Edit purchase order</h1>
                    <Link href={route('inventory.pos.index')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="po_number">PO Number</Label>
                    <Input id="po_number" value={data.po_number} onChange={(e) => setData('po_number', e.target.value.toUpperCase())} required />
                    <InputError message={errors.po_number} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="supplier_name">Supplier</Label>
                    <Input id="supplier_name" value={data.supplier_name} onChange={(e) => setData('supplier_name', e.target.value)} required />
                    <InputError message={errors.supplier_name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="h-10 rounded-md border px-3 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value as any)}>
                        <option value="draft">draft</option>
                        <option value="sent">sent</option>
                        <option value="received">received</option>
                        <option value="partially_received">partially_received</option>
                        <option value="cancelled">cancelled</option>
                    </select>
                    <InputError message={errors.status} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} required />
                    <InputError message={errors.currency} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="expected_at">Expected Date</Label>
                    <Input id="expected_at" type="date" value={data.expected_at ?? ''} onChange={(e) => setData('expected_at', e.target.value)} />
                    <InputError message={errors.expected_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value)} />
                    <InputError message={errors.notes} />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Save</Button>
                    <Link href={route('inventory.pos.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>

                {/* Items Section */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Items</h2>
                        <Button size="sm" variant="outline" onClick={() => setOpenAddItem(true)}>Add Item</Button>
                    </div>
                    <div className="overflow-hidden rounded-md border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Variant</th>
                                    <th className="px-3 py-2 font-medium">SKU</th>
                                    <th className="px-3 py-2 font-medium">Qty</th>
                                    <th className="px-3 py-2 font-medium">Unit Cost</th>
                                    <th className="px-3 py-2 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="px-3 py-2">{it.name || '—'}</td>
                                        <td className="px-3 py-2">{it.sku || '—'}</td>
                                        <td className="px-3 py-2">{it.quantity}</td>
                                        <td className="px-3 py-2">{po.currency} {it.unit_cost.toFixed(2)}</td>
                                        <td className="px-3 py-2">{po.currency} {it.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={5}>No items yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4"><Button onClick={() => setOpenReceive(true)} disabled={items.length===0}>Receive Stock</Button></div>
                </div>
            </form>

            {/* Add Item Drawer */}
            <Sheet open={openAddItem} onOpenChange={setOpenAddItem}>
                <SheetContent side="right">
                    <SheetHeader><SheetTitle>Add PO Item</SheetTitle></SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); addItem.post(route('inventory.pos.items.store', { purchase_order: po.id }), { onSuccess: () => { setOpenAddItem(false); addItem.reset(); } }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="variant">Variant</Label>
                            <select id="variant" className="h-10 rounded-md border px-3 text-sm" value={addItem.data.product_variant_id as any} onChange={(e) => addItem.setData('product_variant_id', Number(e.target.value))}>
                                {variants.map(v => (
                                    <option key={v.id} value={v.id}>{v.label}</option>
                                ))}
                            </select>
                            <InputError message={addItem.errors.product_variant_id as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qty">Quantity</Label>
                            <Input id="qty" type="number" value={addItem.data.quantity as number} onChange={(e) => addItem.setData('quantity', Number(e.target.value))} />
                            <InputError message={addItem.errors.quantity as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit Cost</Label>
                            <Input id="unit" type="number" step="0.01" value={addItem.data.unit_cost as number} onChange={(e) => addItem.setData('unit_cost', Number(e.target.value))} />
                            <InputError message={addItem.errors.unit_cost as string} />
                        </div>
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={addItem.processing}>Add</Button>
                                <Button type="button" variant="outline" onClick={() => setOpenAddItem(false)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Receive Drawer */}
            <Sheet open={openReceive} onOpenChange={setOpenReceive}>
                <SheetContent side="right">
                    <SheetHeader><SheetTitle>Receive All Items</SheetTitle></SheetHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); receiveForm.post(route('inventory.pos.receive', { purchase_order: po.id }), { onSuccess: () => setOpenReceive(false) }); }}
                        className="flex flex-1 flex-col gap-4 p-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="wh">Warehouse</Label>
                            <select id="wh" className="h-10 rounded-md border px-3 text-sm" value={receiveForm.data.warehouse_id as any} onChange={(e) => receiveForm.setData('warehouse_id', Number(e.target.value))}>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                                ))}
                            </select>
                            <InputError message={receiveForm.errors.warehouse_id as string} />
                        </div>
                        <div className="text-sm text-muted-foreground">This will receive all current PO items into the selected warehouse and update inventory.</div>
                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={receiveForm.processing || items.length===0}>Receive</Button>
                                <Button type="button" variant="outline" onClick={() => setOpenReceive(false)}>Cancel</Button>
                            </div>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
