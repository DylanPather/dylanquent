import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Order = { id: number; order_number: string; status: string; total_cents: number; currency: string; placed_at?: string | null };

export default function OrdersIndex({ orders = { data: [] as Order[] } }: { orders: { data: Order[] } }) {
    const items = orders.data ?? [];
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales/orders' }, { title: 'Orders', href: '/sales/orders' }]}>
            <Head title="Orders" />
            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Orders</h1>
                    <p className="text-sm text-muted-foreground">View and manage customer orders.</p>
                </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm">No orders yet</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Orders will appear here when received.</CardContent>
                    </Card>
                )}
                {items.map((o) => (
                    <Card key={o.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{o.order_number}</CardTitle>
                            <Badge variant="secondary">{o.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{o.currency} {(o.total_cents / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Placed</span>
                                <span className="font-medium">{o.placed_at || '—'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}

