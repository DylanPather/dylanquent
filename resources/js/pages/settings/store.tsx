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
import { Building2, Mail, Phone, Globe, DollarSign, Clock, FileText } from 'lucide-react';

export default function StoreSettings() {
    const { settings, countries, currencies, timezones } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.store.update'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Settings', href: '/settings' },
            { title: 'Store', href: '/settings/store' }
        ]}>
            <Head title="Store Settings" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Store Settings</h1>
                    <p className="text-sm text-muted-foreground">Configure your store information and preferences</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Store Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Store Information
                            </CardTitle>
                            <CardDescription>Basic details about your store</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Store Name</Label>
                                <Input
                                    value={data.store_name}
                                    onChange={(e) => setData('store_name', e.target.value)}
                                    placeholder="Your Store Name"
                                    className="h-10"
                                />
                                {errors.store_name && <p className="text-xs text-red-500">{errors.store_name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        value={data.store_email}
                                        onChange={(e) => setData('store_email', e.target.value)}
                                        placeholder="info@store.com"
                                        className="h-10"
                                    />
                                    {errors.store_email && <p className="text-xs text-red-500">{errors.store_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </Label>
                                    <Input
                                        value={data.store_phone || ''}
                                        onChange={(e) => setData('store_phone', e.target.value)}
                                        placeholder="+27 1 234 5678"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Address</Label>
                                <Input
                                    value={data.store_address || ''}
                                    onChange={(e) => setData('store_address', e.target.value)}
                                    placeholder="123 Main Street"
                                    className="h-10"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">City</Label>
                                    <Input
                                        value={data.store_city || ''}
                                        onChange={(e) => setData('store_city', e.target.value)}
                                        placeholder="Johannesburg"
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Country
                                    </Label>
                                    <Select value={data.store_country} onValueChange={(val) => setData('store_country', val)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(countries).map(([code, name]) => (
                                                <SelectItem key={code} value={code}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Regional Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Regional Settings
                            </CardTitle>
                            <CardDescription>Currency, timezone, and localization</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Currency
                                    </Label>
                                    <Select value={data.store_currency} onValueChange={(val) => setData('store_currency', val)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(currencies).map(([code, name]) => (
                                                <SelectItem key={code} value={code}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Timezone
                                    </Label>
                                    <Select value={data.timezone} onValueChange={(val) => setData('timezone', val)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(timezones).map(([tz, name]) => (
                                                <SelectItem key={tz} value={tz}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal & Compliance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Legal & Compliance
                            </CardTitle>
                            <CardDescription>Link to your policy pages</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Terms of Service URL</Label>
                                <Input
                                    type="url"
                                    value={data.terms_url || ''}
                                    onChange={(e) => setData('terms_url', e.target.value)}
                                    placeholder="https://yoursite.com/terms"
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Privacy Policy URL</Label>
                                <Input
                                    type="url"
                                    value={data.privacy_url || ''}
                                    onChange={(e) => setData('privacy_url', e.target.value)}
                                    placeholder="https://yoursite.com/privacy"
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Returns Policy URL</Label>
                                <Input
                                    type="url"
                                    value={data.returns_url || ''}
                                    onChange={(e) => setData('returns_url', e.target.value)}
                                    placeholder="https://yoursite.com/returns"
                                    className="h-10"
                                />
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
