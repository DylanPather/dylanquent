import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Filter,
    MoreHorizontal,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Refund {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    amount: number;
    refund_amount: number;
    reason: string;
    status: string;
    created_at: string;
    refunded_at: string;
}

interface PageProps {
    refunds: {
        data: Refund[];
        meta: any;
    };
    stats: {
        total_refunds: number;
        total_refund_amount: number;
        pending_refunds: number;
        avg_refund: number;
    };
    filters: {
        search: string;
        reason: string;
        refund_status: string;
        sort: string;
    };
}

export default function RefundsIndex() {
    const { refunds: refundsData, stats, filters } = usePage().props as any as PageProps;
    const refunds = refundsData?.data || [];
    const meta = refundsData?.meta || {};

    const [searchQuery, setSearchQuery] = React.useState(filters.search || '');
    const [reasonFilter, setReasonFilter] = React.useState(filters.reason || '');
    const [statusFilter, setStatusFilter] = React.useState(filters.refund_status || '');
    const [sortBy, setSortBy] = React.useState(filters.sort || '-created_at');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (reasonFilter) params.append('reason', reasonFilter);
        if (statusFilter) params.append('refund_status', statusFilter);
        if (sortBy) params.append('sort', sortBy);

        window.location.href = `/sales/refunds?${params.toString()}`;
    };

    const handleSort = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        const newDirection = currentSort === field && !sortBy.startsWith('-') ? '-' : '';
        setSortBy(newDirection + field);

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        params.append('sort', newDirection + field);

        window.location.href = `/sales/refunds?${params.toString()}`;
    };

    const getSortIcon = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        if (currentSort !== field) return null;
        return sortBy.startsWith('-') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Sales', href: '/sales' },
            { title: 'Refunds', href: '/sales/refunds' }
        ]}>
            <Head title="Refunds" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Refunds</h1>
                        <p className="text-sm text-muted-foreground">Manage customer refunds and returns</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Refunds', value: stats.total_refunds, icon: DollarSign, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Total Amount', value: `R${stats.total_refund_amount.toFixed(2)}`, icon: DollarSign, color: 'bg-red-50 text-red-700' },
                        { label: 'Pending', value: stats.pending_refunds, icon: Clock, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Avg Refund', value: `R${stats.avg_refund.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search & Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by order number, customer name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10"
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                            <Button onClick={applyFilters} variant="default" className="h-10">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Reason</Label>
                                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All reasons" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All reasons</SelectItem>
                                        <SelectItem value="customer_request">Customer Request</SelectItem>
                                        <SelectItem value="damaged">Damaged Item</SelectItem>
                                        <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                        <SelectItem value="not_as_described">Not as Described</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 items-end">
                                <Button onClick={applyFilters} className="flex-1 h-10">Apply</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Refunds Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('order_number')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Order {getSortIcon('order_number')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Customer</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('refund_amount_cents')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Amount {getSortIcon('refund_amount_cents')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell font-bold">Reason</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {refunds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-12 h-12 text-emerald-500/30" />
                                                <p className="text-sm font-medium text-muted-foreground">No refunds</p>
                                                <p className="text-xs text-muted-foreground">All refunds are being processed smoothly</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    refunds.map((refund) => (
                                        <TableRow key={refund.id}>
                                            <TableCell>
                                                <Link href={route('sales.orders.show', refund.order_number)}>
                                                    <p className="text-sm font-bold hover:underline text-blue-600">
                                                        #{refund.order_number}
                                                    </p>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">
                                                    <p className="font-bold">{refund.customer_name}</p>
                                                    <p className="text-xs text-muted-foreground">{refund.customer_email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-bold">R{refund.refund_amount.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <span className="text-sm text-muted-foreground">{refund.reason}</span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(refund.status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {refund.status === 'completed' ? refund.refunded_at : refund.created_at}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('sales.orders.show', refund.order_number)}>
                                                                View Order
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {refund.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem>Approve Refund</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">Reject Refund</DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="border-t p-4 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing {meta.from} to {meta.to} of {meta.total} refunds
                            </p>
                            <div className="flex gap-2">
                                <Link href={route('sales.refunds.index', { page: Math.max(1, meta.current_page - 1) })}>
                                    <Button variant="outline" size="sm" disabled={meta.current_page === 1}>Previous</Button>
                                </Link>
                                <Link href={route('sales.refunds.index', { page: Math.min(meta.last_page, meta.current_page + 1) })}>
                                    <Button variant="outline" size="sm" disabled={meta.current_page === meta.last_page}>Next</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
