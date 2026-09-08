import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    DollarSign,
    TrendingUp,
    Receipt,
    Wallet,
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

export default function ExpensesIndex() {
    const { expenses, stats } = usePage().props as any;

    const categoryColors: Record<string, string> = {
        'Shipping': 'bg-blue-50 text-blue-700',
        'Supplies': 'bg-green-50 text-green-700',
        'Marketing': 'bg-purple-50 text-purple-700',
        'Utilities': 'bg-amber-50 text-amber-700',
        'Salaries': 'bg-red-50 text-red-700',
        'Equipment': 'bg-gray-50 text-gray-700',
        'Other': 'bg-gray-50 text-gray-700',
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-50 text-emerald-700">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700">Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Expenses', href: '/finance/expenses' }
        ]}>
            <Head title="Expenses" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Expenses</h1>
                        <p className="text-sm text-muted-foreground">Track and manage business expenses</p>
                    </div>
                    <Link href={route('finance.expenses.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            Add Expense
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Expenses', value: `R${stats.total_expenses.toLocaleString()}`, icon: Wallet, color: 'bg-blue-50 text-blue-700' },
                        { label: 'This Month', value: `R${stats.this_month.toLocaleString()}`, icon: Receipt, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Expense', value: `R${stats.avg_expense.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Categories', value: Object.keys(stats.by_category).length, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Expenses Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Category</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Description</TableHead>
                                    <TableHead className="font-bold">Amount</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense: any) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="text-sm">{expense.date}</TableCell>
                                        <TableCell>
                                            <Badge className={categoryColors[expense.category] || 'bg-gray-50 text-gray-700'}>
                                                {expense.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{expense.description}</TableCell>
                                        <TableCell className="font-bold">R{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>Delete</DropdownMenuItem>
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
