import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    TrendingUp,
    TrendingDown,
    BarChart3,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function CohortsLTVIndex() {
    const { cohorts, stats } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'Cohorts & LTV', href: '/analytics/cohorts-ltv' }
        ]}>
            <Head title="Cohorts & LTV" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Cohorts & LTV</h1>
                    <p className="text-sm text-muted-foreground">Analyze customer cohorts and lifetime value trends</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Avg LTV', value: `R${stats.avg_ltv.toFixed(2)}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Best Cohort', value: stats.best_cohort, icon: BarChart3, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Customers', value: stats.total_customers.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Retention 3m', value: stats.avg_retention_3m, icon: TrendingDown, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Cohorts Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Cohort</TableHead>
                                    <TableHead className="font-bold">Customers</TableHead>
                                    <TableHead className="font-bold">LTV</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">3m Retention</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">6m Retention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cohorts.map((cohort: any) => (
                                    <TableRow key={cohort.month}>
                                        <TableCell className="font-bold">{cohort.month}</TableCell>
                                        <TableCell>{cohort.customers}</TableCell>
                                        <TableCell className="font-bold">
                                            {cohort.ltv ? `R${cohort.ltv.toFixed(2)}` : <Badge variant="secondary">Pending</Badge>}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {cohort.retention_3m ? (
                                                <span className="text-emerald-600 font-semibold">{cohort.retention_3m}</span>
                                            ) : (
                                                <Badge variant="secondary">N/A</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {cohort.retention_6m ? (
                                                <span className="text-emerald-600 font-semibold">{cohort.retention_6m}</span>
                                            ) : (
                                                <Badge variant="secondary">N/A</Badge>
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
