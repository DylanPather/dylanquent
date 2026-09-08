import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    DollarSign,
    TrendingUp,
    AlertCircle,
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

export default function ReconciliationIndex() {
    const { reconciliations, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-emerald-50 text-emerald-700">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Reconciliation', href: '/finance/reconciliation' }
        ]}>
            <Head title="Reconciliation" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Reconciliation</h1>
                    <p className="text-sm text-muted-foreground">Verify account balances and transactions</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Reconciled', value: `R${(stats.total_reconciled / 1000).toFixed(1)}k`, icon: Wallet, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Pending', value: `R${(stats.pending_reconciliation / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Variances', value: stats.variances, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
                        { label: 'Accuracy', value: stats.accuracy, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Reconciliations Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Period</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Expected</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Actual</TableHead>
                                    <TableHead className="font-bold">Variance</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reconciliations.map((recon: any) => (
                                    <TableRow key={recon.id}>
                                        <TableCell className="font-bold">{recon.period}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{recon.expected.toFixed(2)}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{recon.actual.toFixed(2)}</TableCell>
                                        <TableCell className="font-bold">{recon.variance === 0 ? '✓' : `R${recon.variance.toFixed(2)}`}</TableCell>
                                        <TableCell>{getStatusBadge(recon.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    {recon.status === 'pending' && <DropdownMenuItem>Process</DropdownMenuItem>}
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
