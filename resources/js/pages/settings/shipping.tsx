import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Truck, Package, MapPin, DollarSign } from 'lucide-react';

export default function ShippingSettings() {
    const { settings, carriers, countries } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.shipping.update'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Settings', href: '/settings' },
            { title: 'Shipping', href: '/settings/shipping' }
        ]}>
            <Head title="Shipping Settings" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Shipping Settings</h1>
                    <p className="text-sm text-muted-foreground">Configure shipping options and carrier settings</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Origin Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Origin Location
                            </CardTitle>
                            <CardDescription>Where your orders ship from</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Country</Label>
                                    <Select value={data.origin_country} onValueChange={(val) => setData('origin_country', val)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country: string) => (
                                                <SelectItem key={country} value={country.split(',')[1]?.trim() || country}>{country}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">City</Label>
                                    <Input
                                        value={data.origin_city}
                                        onChange={(e) => setData('origin_city', e.target.value)}
                                        placeholder="Johannesburg"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Postal Code</Label>
                                <Input
                                    value={data.origin_postal}
                                    onChange={(e) => setData('origin_postal', e.target.value)}
                                    placeholder="2000"
                                    className="h-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Default Carrier */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Default Carrier
                            </CardTitle>
                            <CardDescription>Primary shipping carrier for new orders</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Carrier</Label>
                                <Select value={data.default_carrier} onValueChange={(val) => setData('default_carrier', val)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {carriers.map((carrier: string) => (
                                            <SelectItem key={carrier} value={carrier}>{carrier.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Free Shipping */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Free Shipping
                            </CardTitle>
                            <CardDescription>Offer free shipping at a threshold</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">
                                    <input type="checkbox" checked={data.free_shipping_enabled} onChange={(e) => setData('free_shipping_enabled', e.target.checked)} className="mr-2" />
                                    Enable Free Shipping
                                </Label>
                            </div>

                            {data.free_shipping_enabled && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Minimum Order Value</Label>
                                    <Input
                                        type="number"
                                        value={data.free_shipping_threshold}
                                        onChange={(e) => setData('free_shipping_threshold', parseInt(e.target.value))}
                                        placeholder="500"
                                        className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">Customers get free shipping on orders over this amount</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Advanced */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Advanced Options
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">
                                    <input type="checkbox" checked={data.calculate_weight} onChange={(e) => setData('calculate_weight', e.target.checked)} className="mr-2" />
                                    Calculate Shipping by Weight
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">
                                    <input type="checkbox" checked={data.pickup_enabled} onChange={(e) => setData('pickup_enabled', e.target.checked)} className="mr-2" />
                                    Enable Pickup Option
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex gap-2">
                        <Button type="submit" className="h-11" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
