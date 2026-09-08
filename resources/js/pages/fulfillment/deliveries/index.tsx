import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Truck,
    TrendingUp,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DeliveriesIndex() {
    const { deliveries, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_transit':
                return <Badge className="bg-blue-50 text-blue-700">In Transit</Badge>;
            case 'delivered':
                return <Badge className="bg-emerald-50 text-emerald-700">Delivered</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Fulfillment', href: '/fulfillment' },
            { title: 'Deliveries', href: '/fulfillment/deliveries' }
        ]}>
            <Head title="Deliveries" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Deliveries</h1>
                        <p className="text-sm text-muted-foreground">Track shipment deliveries</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Deliveries', value: stats.total_deliveries, icon: Truck, color: 'bg-blue-50 text-blue-700' },
                        { label: 'In Transit', value: stats.in_transit, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Avg Days', value: stats.avg_days, icon: Clock, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Deliveries Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Order #</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Customer</TableHead>
                                    <TableHead className="font-bold">Carrier</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Tracking</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Expected</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveries.map((delivery: any) => (
                                    <TableRow key={delivery.id}>
                                        <TableCell className="font-bold">{delivery.order_number}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{delivery.customer}</TableCell>
                                        <TableCell className="text-sm">{delivery.carrier}</TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {delivery.tracking}
                                            </code>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{delivery.expected_delivery}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Tracking</DropdownMenuItem>
                                                    <DropdownMenuItem>Contact Carrier</DropdownMenuItem>
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
