import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Truck,
    TrendingUp,
    DollarSign,
    Clock,
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

export default function CouriersIndex() {
    const { couriers, stats } = usePage().props as any;

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
            { title: 'Fulfillment', href: '/fulfillment' },
            { title: 'Couriers & Rates', href: '/fulfillment/couriers' }
        ]}>
            <Head title="Couriers & Rates" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Couriers & Rates</h1>
                        <p className="text-sm text-muted-foreground">Manage shipping carriers and rates</p>
                    </div>
                    <Link href={route('fulfillment.couriers.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            Add Courier
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Couriers', value: stats.total_couriers, icon: Truck, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Avg Base Rate', value: `R${stats.avg_base_rate}`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Delivery', value: stats.avg_delivery_time, icon: Clock, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Couriers Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Courier</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Base Rate</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Per KG</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Est. Delivery</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {couriers.map((courier: any) => (
                                    <TableRow key={courier.id}>
                                        <TableCell className="font-bold">{courier.name}</TableCell>
                                        <TableCell>{getStatusBadge(courier.status)}</TableCell>
                                        <TableCell className="hidden md:table-cell font-bold">R{courier.base_rate}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{courier.per_kg}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{courier.estimated_delivery}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit Rates</DropdownMenuItem>
                                                    <DropdownMenuItem>{courier.status === 'active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
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
