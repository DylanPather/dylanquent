import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function TicketsIndex() {
    const { tickets, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-red-50 text-red-700">Open</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-50 text-blue-700">In Progress</Badge>;
            case 'resolved':
                return <Badge className="bg-amber-50 text-amber-700">Resolved</Badge>;
            case 'closed':
                return <Badge className="bg-emerald-50 text-emerald-700">Closed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge className="bg-red-50 text-red-700">High</Badge>;
            case 'medium':
                return <Badge className="bg-amber-50 text-amber-700">Medium</Badge>;
            case 'low':
                return <Badge className="bg-green-50 text-green-700">Low</Badge>;
            default:
                return <Badge>{priority}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Support', href: '/support' },
            { title: 'Tickets', href: '/support/tickets' }
        ]}>
            <Head title="Support Tickets" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Support Tickets</h1>
                    <p className="text-sm text-muted-foreground">Manage customer support requests</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Tickets', value: stats.total_tickets, icon: MessageSquare, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Open', value: stats.open, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
                        { label: 'In Progress', value: stats.in_progress, icon: Clock, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tickets Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Ticket</TableHead>
                                    <TableHead className="font-bold">Customer</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Subject</TableHead>
                                    <TableHead className="font-bold">Priority</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket: any) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-bold">{ticket.number}</TableCell>
                                        <TableCell className="font-bold">{ticket.customer}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{ticket.subject}</TableCell>
                                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{ticket.created_at}</TableCell>
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
