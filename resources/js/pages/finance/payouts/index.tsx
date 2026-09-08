import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    Download,
    MoreHorizontal,
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

export default function PayoutsIndex() {
    const { payouts, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-emerald-50 text-emerald-700">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Payouts', href: '/finance/payouts' }
        ]}>
            <Head title="Payouts" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Payouts</h1>
                        <p className="text-sm text-muted-foreground">Track your earnings and payouts</p>
                    </div>
                    <Button variant="outline" className="h-11 gap-2">
                        <Download className="w-5 h-5" />
                        Export
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Payouts', value: stats.total_payouts, icon: DollarSign, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Total Amount', value: `R${(stats.total_amount / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Completed', value: stats.completed_payouts, icon: CheckCircle2, color: 'bg-green-50 text-green-700' },
                        { label: 'Avg Payout', value: `R${(stats.total_amount / stats.total_payouts).toFixed(0)}`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Payouts Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Payout Date</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Reference</TableHead>
                                    <TableHead className="font-bold">Amount</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Method</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((payout: any) => (
                                    <TableRow key={payout.id}>
                                        <TableCell className="font-bold">{payout.payout_date}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {payout.reference}
                                            </code>
                                        </TableCell>
                                        <TableCell className="font-bold">R{payout.amount.toFixed(2)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{payout.method}</TableCell>
                                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Download Receipt</DropdownMenuItem>
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
