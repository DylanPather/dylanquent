import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function RFMAnalysisIndex() {
    const { segments, stats } = usePage().props as any;

    const getSegmentColor = (segment: string): string => {
        const colors: Record<string, string> = {
            'Champions': 'bg-emerald-50 text-emerald-700',
            'Loyal Customers': 'bg-blue-50 text-blue-700',
            'Potential Loyalists': 'bg-purple-50 text-purple-700',
            'At Risk': 'bg-amber-50 text-amber-700',
            'Cannot Lose Them': 'bg-red-50 text-red-700',
            'Lost': 'bg-gray-50 text-gray-700',
        };
        return colors[segment] || 'bg-gray-50 text-gray-700';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'RFM Analysis', href: '/analytics/rfm-analysis' }
        ]}>
            <Head title="RFM Analysis" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">RFM Analysis</h1>
                    <p className="text-sm text-muted-foreground">Analyze customers by Recency, Frequency, and Monetary value</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Customers', value: stats.total_customers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Avg Recency', value: stats.avg_recency, icon: Clock, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Avg Frequency', value: stats.avg_frequency, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Avg Monetary', value: stats.avg_monetary, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* RFM Segments */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Segment</TableHead>
                                    <TableHead className="font-bold">Customers</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Recency</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Frequency</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Monetary</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {segments.map((segment: any) => (
                                    <TableRow key={segment.segment}>
                                        <TableCell className="font-bold">
                                            <Badge className={getSegmentColor(segment.segment)}>
                                                {segment.segment}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">{segment.count.toLocaleString()}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{segment.recency}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{segment.frequency}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{segment.monetary}</TableCell>
                                        <TableCell className="hidden lg:table-cell font-bold">{segment.percentage}</TableCell>
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
