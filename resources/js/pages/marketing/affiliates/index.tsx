import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, TrendingUp, DollarSign, MousePointerClick } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function AffiliatesIndex() {
    const { affiliates, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-50 text-gray-700">Inactive</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Affiliates', href: '/marketing/affiliates' }
        ]}>
            <Head title="Affiliates" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Affiliates</h1>
                        <p className="text-sm text-muted-foreground">Manage your affiliate partners and commissions</p>
                    </div>
                    <Link href={route('marketing.affiliates.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            Invite Affiliate
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Affiliates', value: stats.total_affiliates, icon: Users, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Revenue Generated', value: `R${(stats.total_revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Total Clicks', value: stats.total_clicks.toLocaleString(), icon: MousePointerClick, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Affiliates Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Name</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Email</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Commission</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Revenue</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Clicks</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {affiliates.map((affiliate: any) => (
                                    <TableRow key={affiliate.id}>
                                        <TableCell className="font-bold">
                                            <Link href={route('marketing.affiliates.show', affiliate.id)} className="text-blue-600 hover:underline">
                                                {affiliate.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{affiliate.email}</TableCell>
                                        <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{affiliate.commission}</TableCell>
                                        <TableCell className="hidden lg:table-cell font-bold">R{affiliate.revenue.toFixed(2)}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{affiliate.clicks}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">View</Button>
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
