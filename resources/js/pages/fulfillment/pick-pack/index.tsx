import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Box,
    TrendingUp,
    Package,
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

export default function PickPackIndex() {
    const { orders, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'picking':
                return <Badge className="bg-blue-50 text-blue-700">Picking</Badge>;
            case 'packed':
                return <Badge className="bg-amber-50 text-amber-700">Packed</Badge>;
            case 'ready_to_ship':
                return <Badge className="bg-emerald-50 text-emerald-700">Ready to Ship</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Fulfillment', href: '/fulfillment' },
            { title: 'Pick & Pack', href: '/fulfillment/pick-pack' }
        ]}>
            <Head title="Pick & Pack" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Pick & Pack</h1>
                        <p className="text-sm text-muted-foreground">Manage order picking and packing</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Orders', value: stats.total_orders, icon: Package, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Picking', value: stats.picking, icon: Box, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Packed', value: stats.packed, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Ready to Ship', value: stats.ready_to_ship, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Orders Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Order #</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Customer</TableHead>
                                    <TableHead className="font-bold">Items</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-bold">{order.order_number}</TableCell>
                                        <TableCell className="hidden md:table-cell">{order.customer}</TableCell>
                                        <TableCell className="font-bold">{order.items_count} items</TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{order.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Order</DropdownMenuItem>
                                                    <DropdownMenuItem>Mark as Packed</DropdownMenuItem>
                                                    <DropdownMenuItem>Ready to Ship</DropdownMenuItem>
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
