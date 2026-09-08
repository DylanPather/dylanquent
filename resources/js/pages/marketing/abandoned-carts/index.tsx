import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp, RotateCcw, DollarSign } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function AbandonedCartsIndex() {
    const { carts, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            case 'recovered':
                return <Badge className="bg-emerald-50 text-emerald-700">Recovered</Badge>;
            case 'expired':
                return <Badge className="bg-gray-50 text-gray-700">Expired</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Abandoned Carts', href: '/marketing/abandoned-carts' }
        ]}>
            <Head title="Abandoned Carts" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Abandoned Carts</h1>
                    <p className="text-sm text-muted-foreground">Recover lost sales by reminding customers about their carts</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Abandoned', value: stats.total_abandoned, icon: ShoppingCart, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Pending Recovery', value: stats.pending_recovery, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Recovered', value: stats.recovered, icon: RotateCcw, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Value', value: `R${(stats.total_value / 1000).toFixed(1)}k`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Carts Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Customer</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Email</TableHead>
                                    <TableHead className="font-bold">Items</TableHead>
                                    <TableHead className="font-bold">Value</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Abandoned</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carts.map((cart: any) => (
                                    <TableRow key={cart.id}>
                                        <TableCell className="font-bold">{cart.customer}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{cart.email}</TableCell>
                                        <TableCell>{cart.items}</TableCell>
                                        <TableCell className="font-bold">R{cart.value.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(cart.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{cart.abandoned_at}</TableCell>
                                        <TableCell className="text-right">
                                            {cart.status === 'pending' && (
                                                <Button variant="outline" size="sm">Send Email</Button>
                                            )}
                                            {cart.status !== 'pending' && (
                                                <Button variant="ghost" size="sm" disabled>View</Button>
                                            )}
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
