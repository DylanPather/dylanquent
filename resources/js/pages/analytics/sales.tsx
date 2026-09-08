import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Users,
    Filter,
    Download,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function SalesAnalytics() {
    const { metrics, dailyRevenue, topProducts, paymentMethods, period } = usePage().props as any;

    const handlePeriodChange = (newPeriod: string) => {
        window.location.href = `/analytics/sales?period=${newPeriod}`;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'Sales Reports', href: '/analytics/sales' }
        ]}>
            <Head title="Sales Reports" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Sales Reports</h1>
                        <p className="text-sm text-muted-foreground">Analyze your sales performance and trends</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-[180px] h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="last_7">Last 7 days</SelectItem>
                                <SelectItem value="last_30">Last 30 days</SelectItem>
                                <SelectItem value="last_90">Last 90 days</SelectItem>
                                <SelectItem value="mtd">Month to Date</SelectItem>
                                <SelectItem value="ytd">Year to Date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-10">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Revenue', value: `R${metrics.total_revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Orders', value: metrics.total_orders.toLocaleString(), icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Avg Order Value', value: `R${metrics.avg_order_value.toFixed(2)}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Unique Customers', value: metrics.total_customers.toLocaleString(), icon: Users, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Daily Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dailyRevenue.length > 0 ? (
                                <div className="h-64 flex items-end gap-1">
                                    {dailyRevenue.map((day: any) => {
                                        const maxRevenue = Math.max(...dailyRevenue.map((d: any) => d.revenue));
                                        const height = (day.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                                    style={{ height: `${height}%`, minHeight: '2px' }}
                                                    title={`${day.date}: R${day.revenue.toFixed(2)}`}
                                                />
                                                <span className="text-[10px] text-muted-foreground text-center">
                                                    {new Date(day.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No sales data for this period
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products & Payment Methods */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {topProducts.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold">Product</TableHead>
                                            <TableHead className="font-bold">Sold</TableHead>
                                            <TableHead className="font-bold">Qty</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.map((product: any) => (
                                            <TableRow key={product.sku}>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm font-bold">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-bold">{product.sold}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{product.total_qty}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No sales data
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {paymentMethods.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold">Method</TableHead>
                                            <TableHead className="font-bold">Count</TableHead>
                                            <TableHead className="font-bold">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentMethods.map((method: any) => (
                                            <TableRow key={method.payment_method}>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {method.payment_method || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-bold">{method.count}</TableCell>
                                                <TableCell className="text-sm font-bold">R{method.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No payment data
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
