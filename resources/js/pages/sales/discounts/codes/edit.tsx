import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type Discount = { id: number; name: string; code: string; type: 'percent'|'fixed_amount'; value: number; min_order_value: number | null; usage_limit: number | null; is_active: boolean; starts_at?: string | null; ends_at?: string | null };

export default function DiscountEdit() {
    const { props } = usePage<{ discount: Discount }>();
    const discount = props.discount;
    const { data, setData, put, processing, errors } = useForm({ ...discount });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('sales.discounts.codes.update', { discount: discount.id }));
    }
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales/orders' }, { title: 'Discounts', href: '/sales/discounts/codes' }, { title: discount.code, href: `/sales/discounts/codes/${discount.id}/edit` }]}>
            <Head title={`Edit Discount ${discount.code}`} />
            <form onSubmit={submit} className="grid gap-6 p-4 md:max-w-xl md:p-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">Edit discount code</h1>
                    <Link href={route('sales.discounts.codes.index')}>
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
                <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={data.type} onValueChange={(v: any) => setData('type', v)}>
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percent">Percent</SelectItem>
                            <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.type} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" type="number" value={data.value} onChange={(e) => setData('value', Number(e.target.value))} required />
                    <InputError message={errors.value as string} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="min_order_value">Min order value (R)</Label>
                    <Input id="min_order_value" type="number" step="0.01" value={data.min_order_value ?? ''} onChange={(e) => setData('min_order_value', e.target.value === '' ? null : Number(e.target.value))} />
                    <InputError message={errors.min_order_value as string} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="usage_limit">Usage limit</Label>
                    <Input id="usage_limit" type="number" value={data.usage_limit ?? ''} onChange={(e) => setData('usage_limit', e.target.value === '' ? null : Number(e.target.value))} />
                    <InputError message={errors.usage_limit as string} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="starts_at">Starts at</Label>
                        <Input id="starts_at" type="date" value={data.starts_at ?? ''} onChange={(e) => setData('starts_at', e.target.value)} />
                        <InputError message={errors.starts_at as string} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ends_at">Ends at</Label>
                        <Input id="ends_at" type="date" value={data.ends_at ?? ''} onChange={(e) => setData('ends_at', e.target.value)} />
                        <InputError message={errors.ends_at as string} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="is_active" checked={!!data.is_active} onCheckedChange={(v: boolean) => setData('is_active', !!v)} />
                    <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>Save</Button>
                    <Link href={route('sales.discounts.codes.index')}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

