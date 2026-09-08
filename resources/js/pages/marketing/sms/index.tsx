import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, TrendingUp, CheckCircle2, MousePointerClick } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function SMSIndex() {
    const { campaigns, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-50 text-blue-700">Scheduled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'SMS Campaigns', href: '/marketing/sms' }
        ]}>
            <Head title="SMS Campaigns" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">SMS & WhatsApp Campaigns</h1>
                        <p className="text-sm text-muted-foreground">Send SMS and WhatsApp messages to customers</p>
                    </div>
                    <Link href={route('marketing.sms.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Campaign
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Campaigns', value: stats.total_campaigns, icon: MessageSquare, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Sent', value: stats.total_sent.toLocaleString(), icon: CheckCircle2, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Delivery Rate', value: stats.delivery_rate, icon: MousePointerClick, color: 'bg-amber-50 text-amber-700' },
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
                                    <TableHead className="hidden md:table-cell font-bold">Delivered</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Clicks</TableHead>
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
                                        <TableCell className="hidden md:table-cell">{campaign.delivered.toLocaleString()}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{campaign.clicks}</TableCell>
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
