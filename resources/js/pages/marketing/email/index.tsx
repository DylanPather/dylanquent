import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, TrendingUp, Eye, MousePointerClick } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function EmailIndex() {
    const { campaigns, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-50 text-blue-700">Scheduled</Badge>;
            case 'completed':
                return <Badge className="bg-gray-50 text-gray-700">Completed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Email Campaigns', href: '/marketing/email' }
        ]}>
            <Head title="Email Campaigns" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Email Campaigns</h1>
                        <p className="text-sm text-muted-foreground">Create and manage email marketing campaigns</p>
                    </div>
                    <Link href={route('marketing.email.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Campaign
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Campaigns', value: stats.total_campaigns, icon: Mail, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Sent', value: stats.total_sent.toLocaleString(), icon: Mail, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Open Rate', value: stats.avg_open_rate, icon: Eye, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Campaigns Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Campaign</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Sent</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Opens</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Click Rate</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign: any) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-bold">{campaign.name}</TableCell>
                                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{campaign.sent.toLocaleString()}</TableCell>
                                        <TableCell className="hidden md:table-cell">{campaign.opens}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{campaign.click_rate}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{campaign.created_at}</TableCell>
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
