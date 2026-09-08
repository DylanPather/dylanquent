import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    Package,
    DollarSign,
    Eye,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function ProductPerformanceIndex() {
    const { products, stats } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'Product Performance', href: '/analytics/product-performance' }
        ]}>
            <Head title="Product Performance" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Product Performance</h1>
                    <p className="text-sm text-muted-foreground">Analyze sales and engagement metrics by product</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Products', value: stats.total_products, icon: Package, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Total Sold', value: stats.total_sold.toLocaleString(), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Revenue', value: `R${(stats.total_revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Conversion', value: stats.avg_conversion, icon: Eye, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Products Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Product</TableHead>
                                    <TableHead className="font-bold">SKU</TableHead>
                                    <TableHead className="font-bold">Sold</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Revenue</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Views</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Conversion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product: any) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-bold">
                                            <Link href={route('analytics.products.show', product.id)} className="text-blue-600 hover:underline">
                                                {product.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell className="font-bold">{product.sold}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{product.revenue.toFixed(2)}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{product.views.toLocaleString()}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{product.conversion}</TableCell>
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
