import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Smartphone, ShoppingCart, TrendingUp } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function SalesChannels() {
    const { channels, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'connected':
                return <Badge className="bg-blue-50 text-blue-700">Connected</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-50 text-gray-700">Inactive</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'web':
                return <Globe className="w-5 h-5" />;
            case 'mobile':
                return <Smartphone className="w-5 h-5" />;
            case 'social':
                return <ShoppingCart className="w-5 h-5" />;
            default:
                return <TrendingUp className="w-5 h-5" />;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Settings', href: '/settings' },
            { title: 'Sales Channels', href: '/settings/sales-channels' }
        ]}>
            <Head title="Sales Channels" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Sales Channels</h1>
                    <p className="text-sm text-muted-foreground">Manage and track sales across multiple channels</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Channels', value: stats.total_channels, icon: ShoppingCart, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Orders', value: stats.total_orders.toLocaleString(), icon: Globe, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Total Revenue', value: `R${(stats.total_revenue / 1000).toFixed(1)}k`, icon: Smartphone, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Channels Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Channel</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Type</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Orders</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Revenue</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {channels.map((channel: any) => (
                                    <TableRow key={channel.id}>
                                        <TableCell className="font-bold flex items-center gap-2">
                                            {getChannelIcon(channel.type)} {channel.name}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell capitalize text-sm">{channel.type}</TableCell>
                                        <TableCell>{getStatusBadge(channel.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell font-bold">{channel.orders}</TableCell>
                                        <TableCell className="hidden lg:table-cell font-bold">R{channel.revenue.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Manage</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
