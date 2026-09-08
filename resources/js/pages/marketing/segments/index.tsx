import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function SegmentsIndex() {
    const { segments, stats } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Customer Segments', href: '/marketing/segments' }
        ]}>
            <Head title="Customer Segments" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Customer Segments</h1>
                        <p className="text-sm text-muted-foreground">Target specific customer groups with campaigns</p>
                    </div>
                    <Link href={route('marketing.segments.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Segment
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Segments', value: stats.total_segments, icon: Users, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Customers', value: stats.total_customers.toLocaleString(), icon: BarChart3, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg LTV', value: `R${stats.avg_ltv.toFixed(0)}`, icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Segments Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Segment</TableHead>
                                    <TableHead className="font-bold">Customers</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Avg LTV</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {segments.map((segment: any) => (
                                    <TableRow key={segment.id}>
                                        <TableCell className="font-bold">{segment.name}</TableCell>
                                        <TableCell className="font-bold">{segment.size}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{segment.ltv.toFixed(0)}</TableCell>
                                        <TableCell className="hidden lg:table-cell capitalize">{segment.status}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{segment.created_at}</TableCell>
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
