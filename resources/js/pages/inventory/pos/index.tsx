import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PO = { id: number; po_number: string; supplier_name: string; status: string; total_cents: number; currency: string; expected_at?: string | null };

export default function PurchaseOrders({ purchaseOrders = { data: [] as PO[] } }: { purchaseOrders: { data: PO[] } }) {
    const pos = purchaseOrders.data ?? [];
    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory/stock' }, { title: 'Purchase Orders', href: '/inventory/pos' }]}>
            <Head title="Purchase Orders" />

            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Purchase Orders</h1>
                    <p className="text-sm text-muted-foreground">Track inbound stock from suppliers.</p>
                </div>
                <Link href={route('inventory.pos.create')}>
                    <Button>New PO</Button>
                </Link>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {pos.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm">No purchase orders</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Create a PO to replenish inventory.</CardContent>
                    </Card>
                )}
                {pos.map((po) => (
                    <Card key={po.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{po.po_number}</CardTitle>
                            <Badge variant="secondary">{po.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Supplier</span>
                                <span className="font-medium">{po.supplier_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{po.currency} {(po.total_cents / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Expected</span>
                                <span className="font-medium">{po.expected_at || '—'}</span>
                            </div>
                            <div className="pt-2 text-right">
                                <Link href={route('inventory.pos.edit', { purchase_order: po.id })} className="text-xs underline underline-offset-2">Edit</Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
