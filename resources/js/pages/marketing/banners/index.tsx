import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, PanelBottom, TrendingUp, Eye, MousePointerClick } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function BannersIndex() {
    const { banners, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-50 text-gray-700">Inactive</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'On-Site Banners', href: '/marketing/banners' }
        ]}>
            <Head title="On-Site Banners" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">On-Site Banners</h1>
                        <p className="text-sm text-muted-foreground">Create and manage promotional banners</p>
                    </div>
                    <Link href={route('marketing.banners.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Banner
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Banners', value: stats.total_banners, icon: PanelBottom, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg CTR', value: stats.avg_ctr, icon: MousePointerClick, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Banners Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Banner</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Type</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Views</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Clicks</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">CTR</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.map((banner: any) => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-bold">{banner.title}</TableCell>
                                        <TableCell className="hidden md:table-cell capitalize text-sm">{banner.type}</TableCell>
                                        <TableCell>{getStatusBadge(banner.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{banner.views.toLocaleString()}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{banner.clicks}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{banner.ctr}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Edit</Button>
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
