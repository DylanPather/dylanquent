import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, LogOut, Key } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function SecuritySettings() {
    const { settings, sessions } = usePage().props as any;
    const { data, setData, post, processing } = useForm(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.security.update'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Settings', href: '/settings' },
            { title: 'Security', href: '/settings/security' }
        ]}>
            <Head title="Security Settings" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Security Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage account security and access controls</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Two Factor */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>Add an extra layer of security</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Status</span>
                                <Badge className={data.two_factor_enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-700"}>
                                    {data.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <Button variant="outline" className="w-full">
                                {data.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* API Keys */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                API Keys
                            </CardTitle>
                            <CardDescription>Generate API keys for third-party integrations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                                sk_live_placeholder_not_a_real_key
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">Copy Key</Button>
                                <Button variant="outline" className="flex-1">Regenerate</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Keep your API key secret. Don't share it publicly.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LogOut className="w-5 h-5" />
                                Active Sessions
                            </CardTitle>
                            <CardDescription>Devices logged into your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-bold">Device</TableHead>
                                            <TableHead className="hidden md:table-cell font-bold">Location</TableHead>
                                            <TableHead className="hidden md:table-cell font-bold">Last Active</TableHead>
                                            <TableHead className="text-right font-bold">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map((session: any) => (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-bold">{session.device}</TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">{session.location}</TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">{session.last_active}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Revoke</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
