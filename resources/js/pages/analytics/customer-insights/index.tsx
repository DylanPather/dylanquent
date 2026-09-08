import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    ShoppingCart,
    Percent,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function CustomerInsightsIndex() {
    const { customers, stats } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'Customer Insights', href: '/analytics/customer-insights' }
        ]}>
            <Head title="Customer Insights" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Customer Insights</h1>
                    <p className="text-sm text-muted-foreground">Understand customer behavior and lifetime value</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Avg LTV', value: `R${stats.avg_ltv.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Avg Orders', value: stats.avg_orders, icon: ShoppingCart, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Returning Rate', value: stats.returning_rate, icon: Percent, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Customers Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Customer</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Email</TableHead>
                                    <TableHead className="font-bold">Orders</TableHead>
                                    <TableHead className="font-bold">LTV</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Last Order</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer: any) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-bold">
                                            <Link href={route('analytics.customers.show', customer.id)} className="text-blue-600 hover:underline">
                                                {customer.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{customer.email}</TableCell>
                                        <TableCell className="font-bold">{customer.orders}</TableCell>
                                        <TableCell className="font-bold">R{customer.ltv.toFixed(2)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{customer.last_order}</TableCell>
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
