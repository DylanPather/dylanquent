import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    RotateCcw,
    TrendingUp,
    Clock,
    CheckCircle2,
    X,
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

export default function ReturnsIndex() {
    const { returns, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'requested':
                return <Badge className="bg-blue-50 text-blue-700">Requested</Badge>;
            case 'approved':
                return <Badge className="bg-emerald-50 text-emerald-700">Approved</Badge>;
            case 'returned':
                return <Badge className="bg-purple-50 text-purple-700">Returned</Badge>;
            case 'declined':
                return <Badge variant="destructive">Declined</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Fulfillment', href: '/fulfillment' },
            { title: 'Returns', href: '/fulfillment/returns' }
        ]}>
            <Head title="Returns" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Returns</h1>
                        <p className="text-sm text-muted-foreground">Manage customer returns and RMAs</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Returns', value: stats.total_returns, icon: RotateCcw, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Requested', value: stats.requested, icon: Clock, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Returned', value: stats.returned, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Returns Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Return #</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Order #</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Customer</TableHead>
                                    <TableHead className="font-bold">Reason</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Created</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returns.map((ret: any) => (
                                    <TableRow key={ret.id}>
                                        <TableCell className="font-bold">{ret.return_number}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{ret.order_number}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{ret.customer}</TableCell>
                                        <TableCell className="text-sm">{ret.reason}</TableCell>
                                        <TableCell>{getStatusBadge(ret.status)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{ret.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-2xl">⋯</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Approve</DropdownMenuItem>
                                                    <DropdownMenuItem>Decline</DropdownMenuItem>
                                                    <DropdownMenuItem>Generate RMA</DropdownMenuItem>
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
