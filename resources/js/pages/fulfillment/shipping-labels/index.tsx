import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    Download,
    Truck,
    Package,
    DollarSign,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    FileText,
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

interface ShippingLabel {
    id: number;
    order_number: string;
    customer_name: string;
    carrier: string;
    tracking_number: string;
    service_type: string;
    cost: number;
    weight: number;
    status: string;
    created_at: string;
    label_url: string;
}

interface PageProps {
    labels: {
        data: ShippingLabel[];
        meta: any;
    };
    stats: {
        total_labels: number;
        orders_shipped: number;
        total_cost: number;
        avg_cost: number;
    };
    filters: {
        search: string;
        carrier: string;
        sort: string;
    };
}

export default function ShippingLabelsIndex() {
    const { labels: labelsData, stats, filters } = usePage().props as any as PageProps;
    const labels = labelsData?.data || [];
    const meta = labelsData?.meta || {};

    const [searchQuery, setSearchQuery] = React.useState(filters.search || '');
    const [carrierFilter, setCarrierFilter] = React.useState(filters.carrier || '');
    const [sortBy, setSortBy] = React.useState(filters.sort || '-created_at');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (carrierFilter) params.append('carrier', carrierFilter);
        if (sortBy) params.append('sort', sortBy);

        window.location.href = `/fulfillment/labels?${params.toString()}`;
    };

    const handleSort = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        const newDirection = currentSort === field && !sortBy.startsWith('-') ? '-' : '';
        setSortBy(newDirection + field);

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        params.append('sort', newDirection + field);

        window.location.href = `/fulfillment/labels?${params.toString()}`;
    };

    const getSortIcon = (field: string) => {
        const currentSort = sortBy.replace('-', '');
        if (currentSort !== field) return null;
        return sortBy.startsWith('-') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Fulfillment', href: '/fulfillment' },
            { title: 'Shipping Labels', href: '/fulfillment/labels' }
        ]}>
            <Head title="Shipping Labels" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Shipping Labels</h1>
                        <p className="text-sm text-muted-foreground">Create and manage shipment labels</p>
                    </div>
                    <Button className="gap-2 h-11">
                        <Plus className="w-5 h-5" />
                        Create Label
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Labels', value: stats.total_labels, icon: FileText, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Orders Shipped', value: stats.orders_shipped, icon: Truck, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Cost', value: `R${stats.total_cost.toFixed(2)}`, icon: DollarSign, color: 'bg-red-50 text-red-700' },
                        { label: 'Avg Cost', value: `R${stats.avg_cost.toFixed(2)}`, icon: Package, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search & Filter */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by order number or tracking..."
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Carrier</Label>
                                <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All carriers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All carriers</SelectItem>
                                        <SelectItem value="USPS">USPS</SelectItem>
                                        <SelectItem value="UPS">UPS</SelectItem>
                                        <SelectItem value="FedEx">FedEx</SelectItem>
                                        <SelectItem value="DHL">DHL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 items-end">
                                <Button onClick={applyFilters} className="flex-1 h-10">Apply</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Labels Table */}
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
                                    <TableHead className="font-bold">Carrier</TableHead>
                                    <TableHead className="font-bold">Tracking</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Service</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('cost_cents')}>
                                        <div className="flex items-center gap-2 font-bold">
                                            Cost {getSortIcon('cost_cents')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Truck className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-sm font-medium text-muted-foreground">No shipping labels</p>
                                                <p className="text-xs text-muted-foreground">Create labels for orders to track shipments</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    labels.map((label) => (
                                        <TableRow key={label.id}>
                                            <TableCell>
                                                <p className="text-sm font-bold">#{label.order_number}</p>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm">{label.customer_name}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{label.carrier}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                                    {label.tracking_number}
                                                </code>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-sm">
                                                {label.service_type}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold">R{label.cost.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download Label
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            View Tracking
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
                </Card>
            </div>
        </AppLayout>
    );
}
