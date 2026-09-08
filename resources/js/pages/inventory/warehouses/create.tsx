import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

export default function WarehouseCreate() {
    const { data, setData, post, processing, errors } = useForm({ name: '', code: '', is_active: true });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('inventory.warehouses.store'));
    }
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Warehouses', href: '/inventory/warehouses' }, { title: 'Create', href: '/inventory/warehouses/create' }]}>
            <Head title="New Warehouse" />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-md md:p-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Create warehouse</h1>
                    <Link href={route('inventory.warehouses.index')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <InputError message={errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())} required />
                    <InputError message={errors.code} />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="is_active" checked={!!data.is_active} onCheckedChange={(v: boolean) => setData('is_active', !!v)} />
                    <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Create</Button>
                    <Link href={route('inventory.warehouses.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

