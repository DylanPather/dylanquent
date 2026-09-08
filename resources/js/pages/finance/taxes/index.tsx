import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
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

export default function TaxesIndex() {
    const { taxes, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            case 'paid':
                return <Badge className="bg-emerald-50 text-emerald-700">Paid</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Taxes (VAT)', href: '/finance/taxes' }
        ]}>
            <Head title="Taxes" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Tax Management (VAT)</h1>
                    <p className="text-sm text-muted-foreground">Track VAT liability and payments</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'YTD Sales', value: `R${(stats.ytd_sales / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Tax Liability', value: `R${(stats.ytd_tax_liability / 1000).toFixed(1)}k`, icon: DollarSign, color: 'bg-red-50 text-red-700' },
                        { label: 'Pending', value: `R${(stats.pending_amount / 1000).toFixed(1)}k`, icon: AlertCircle, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Tax Rate', value: stats.tax_rate, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Taxes Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Period</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Sales</TableHead>
                                    <TableHead className="font-bold">Rate</TableHead>
                                    <TableHead className="font-bold">Amount</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Due Date</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxes.map((tax: any) => (
                                    <TableRow key={tax.id}>
                                        <TableCell className="font-bold">{tax.period}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{tax.sales.toFixed(2)}</TableCell>
                                        <TableCell>{tax.rate}</TableCell>
                                        <TableCell className="font-bold">R{tax.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(tax.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{tax.due_date}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    {tax.status === 'pending' && <DropdownMenuItem>Record Payment</DropdownMenuItem>}
                                                    <DropdownMenuItem>Download Report</DropdownMenuItem>
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
