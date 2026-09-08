import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function POCreate() {
    const { data, setData, post, processing, errors } = useForm({
        po_number: '', supplier_name: '', currency: 'ZAR', expected_at: '', notes: ''
    });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('inventory.pos.store'));
    }
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Purchase Orders', href: '/inventory/pos' }, { title: 'Create', href: '/inventory/pos/create' }]}>
            <Head title="New Purchase Order" />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-xl md:p-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Create purchase order</h1>
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
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} required />
                    <InputError message={errors.currency} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="expected_at">Expected Date</Label>
                    <Input id="expected_at" type="date" value={data.expected_at} onChange={(e) => setData('expected_at', e.target.value)} />
                    <InputError message={errors.expected_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    <InputError message={errors.notes} />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Create</Button>
                    <Link href={route('inventory.pos.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

