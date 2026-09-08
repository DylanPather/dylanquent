import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Mail,
    MessageSquare,
    TrendingUp,
    Clock,
    MoreHorizontal,
    Eye,
    MousePointerClick,
    Send,
    Badge as BadgeIcon,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CampaignsIndex() {
    const { campaigns, stats } = usePage().props as any;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="w-4 h-4" />;
            case 'sms':
                return <MessageSquare className="w-4 h-4" />;
            default:
                return <BadgeIcon className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-50 text-blue-700">Scheduled</Badge>;
            case 'completed':
                return <Badge variant="secondary">Completed</Badge>;
            case 'paused':
                return <Badge className="bg-amber-50 text-amber-700">Paused</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Campaigns', href: '/marketing/campaigns' }
        ]}>
            <Head title="Campaigns" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Campaigns</h1>
                        <p className="text-sm text-muted-foreground">Create and manage marketing campaigns</p>
                    </div>
                    <Link href={route('marketing.campaigns.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            Create Campaign
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Campaigns', value: stats.total_campaigns, icon: BadgeIcon, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active_campaigns, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Sent', value: stats.total_sent.toLocaleString(), icon: Send, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Est. Revenue', value: `R${(stats.total_revenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
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
                                    <TableHead className="hidden md:table-cell font-bold">Type</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold flex items-center gap-1">
                                        <Send className="w-4 h-4" /> Sent
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> Opens
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold flex items-center gap-1">
                                        <MousePointerClick className="w-4 h-4" /> Clicks
                                    </TableHead>
                                    <TableHead className="font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign: any) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-bold">{campaign.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(campaign.type)}
                                                <span className="text-sm capitalize">{campaign.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{campaign.sent.toLocaleString()}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{campaign.opens}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{campaign.clicks}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{campaign.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    {campaign.status === 'active' && (
                                                        <DropdownMenuItem>Pause</DropdownMenuItem>
                                                    )}
                                                    {campaign.status === 'paused' && (
                                                        <DropdownMenuItem>Resume</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
