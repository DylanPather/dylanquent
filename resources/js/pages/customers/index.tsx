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
    Users,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
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

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
    created_at: string;
    status: 'vip' | 'active' | 'inactive';
}

interface PageProps {
    customers: {
        data: Customer[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        total_spent: number;
        avg_order_value: number;
    };
    filters: {
        search: string;
        sort: string;
    };
}

export default function CustomersIndex() {
    const { customers: customersData, stats, filters } = usePage().props as any as PageProps;
    const customers = customersData?.data || [];
    const meta = customersData?.meta || {};

    const [searchQuery, setSearchQuery] = React.useState(filters.search || '');
    const [sortBy, setSortBy] = React.useState(filters.sort || '-created_at');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        window.location.href = `/customers?${params.toString()}`;
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSortBy('-created_at');
        window.location.href = '/customers';
    };

    const handleSort = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        const newDirection = currentSort === field && !sortBy.startsWith('-') ? '-' : '';
        setSortBy(newDirection + field);

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        params.append('sort', newDirection + field);

        window.location.href = `/customers?${params.toString()}`;
    };

    const getSortIcon = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        if (currentSort !== field) return null;
        return sortBy.startsWith('-') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'vip':
                return <Badge className="bg-purple-50 text-purple-700 border-purple-200">VIP</Badge>;
            case 'active':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Customers', href: '/customers' }]}>
            <Head title="Customers" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Customers</h1>
                        <p className="text-sm text-muted-foreground">Manage customer relationships and view order history</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {[
                        { label: 'Total Customers', value: stats.total, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Active', value: stats.active, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Inactive', value: stats.inactive, color: 'bg-slate-50 text-slate-700' },
                        { label: 'Total Spent', value: `R${stats.total_spent.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg Order', value: `R${stats.avg_order_value.toFixed(2)}`, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString?.() || stat.value}</p>
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
                                    placeholder="Search by name, email, or phone..."
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
                            {(searchQuery || sortBy !== '-created_at') && (
                                <Button onClick={resetFilters} variant="outline" className="h-10">
                                    Reset
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Customers Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Customer {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('orders')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Orders {getSortIcon('orders')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hidden lg:table-cell" onClick={() => handleSort('spent')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Spent {getSortIcon('spent')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell font-bold">Status</TableHead>
                                    <TableHead className="font-bold">Last Order</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-sm font-medium text-muted-foreground">No customers found</p>
                                                <p className="text-xs text-muted-foreground">Customers will appear here after placing orders</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <Link href={route('customers.show', customer.id)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                            <span className="text-sm font-bold">
                                                                {customer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold truncate hover:underline">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">Joined {customer.created_at}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline truncate">
                                                            {customer.email}
                                                        </a>
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                                            <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                                                                {customer.phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold">{customer.total_orders}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <span className="text-sm font-bold">
                                                    R{customer.total_spent.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {getStatusBadge(customer.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {customer.last_order_date || 'Never'}
                                                </div>
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
                                                            <Link href={route('customers.show', customer.id)}>
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <a href={`mailto:${customer.email}`}>
                                                                Send Email
                                                            </a>
                                                        </DropdownMenuItem>
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
                                Showing {meta.from?.toLocaleString()} to {meta.to?.toLocaleString()} of {meta.total?.toLocaleString()} customers
                            </p>
                            <div className="flex gap-2">
                                <Link href={route('customers.index', { page: Math.max(1, meta.current_page - 1), ...filters })}>
                                    <Button variant="outline" size="sm" disabled={meta.current_page === 1}>Previous</Button>
                                </Link>
                                {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                                    const page = i + Math.max(1, meta.current_page - 2);
                                    if (page > meta.last_page) return null;
                                    return (
                                        <Link key={page} href={route('customers.index', { page, ...filters })}>
                                            <Button
                                                variant={page === meta.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                className="min-w-10"
                                            >
                                                {page}
                                            </Button>
                                        </Link>
                                    );
                                })}
                                <Link href={route('customers.index', { page: Math.min(meta.last_page, meta.current_page + 1), ...filters })}>
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
