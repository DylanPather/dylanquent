import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Mail,
    Phone,
    ArrowLeft,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Calendar,
    Copy,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface Order {
    id: string;
    date: string;
    total: number;
    status: string;
    items_count: number;
}

interface PageProps {
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
        created_at: string;
    };
    stats: {
        total_orders: number;
        total_spent: number;
        avg_order_value: number;
        last_order: string;
    };
    orders: Order[];
}

export default function CustomerShow() {
    const { customer, stats, orders } = usePage().props as any as PageProps;

    const copyEmail = () => {
        navigator.clipboard.writeText(customer.email);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-50 text-emerald-700';
            case 'pending':
                return 'bg-amber-50 text-amber-700';
            case 'shipped':
                return 'bg-blue-50 text-blue-700';
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700';
            case 'refunded':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-slate-50 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Customers', href: '/customers' },
            { title: customer.name, href: `/customers/${customer.id}` }
        ]}>
            <Head title={customer.name} />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/customers">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
                                <p className="text-sm text-muted-foreground">Customer since {customer.created_at}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <div className="flex items-center gap-2">
                                                <a href={`mailto:${customer.email}`} className="text-sm font-mono text-blue-600 hover:underline break-all">
                                                    {customer.email}
                                                </a>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyEmail}>
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Phone</p>
                                                <a href={`tel:${customer.phone}`} className="text-sm font-mono text-blue-600 hover:underline">
                                                    {customer.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.total_orders}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                                        R{stats.total_spent.toFixed(0)}
                                    </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Order</p>
                                    <p className="text-xl font-black text-purple-700 dark:text-purple-400">
                                        R{stats.avg_order_value.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {orders && orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold">Order ID</TableHead>
                                            <TableHead className="font-bold">Date</TableHead>
                                            <TableHead className="font-bold">Items</TableHead>
                                            <TableHead className="font-bold">Total</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right font-bold">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono font-bold">{order.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        {order.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</TableCell>
                                                <TableCell className="font-bold">R{order.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('sales.orders.show', order.id.replace('#', ''))}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">No orders yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
