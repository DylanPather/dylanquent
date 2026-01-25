import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type Warehouse = { id: number; name: string; code: string; is_active: boolean };

export default function WarehouseEdit() {
    const { props } = usePage<{ warehouse: Warehouse }>();
    const { data, setData, put, processing, errors } = useForm({ ...props.warehouse });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('inventory.warehouses.update', { warehouse: data.id }));
    }
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Warehouses', href: '/inventory/warehouses' }, { title: 'Edit', href: `/inventory/warehouses/${data.id}/edit` }]}>
            <Head title={`Warehouse ${data.code}`} />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-md md:p-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Edit warehouse</h1>
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
                    <Button type="submit" disabled={processing}>Save</Button>
                    <Link href={route('inventory.warehouses.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

