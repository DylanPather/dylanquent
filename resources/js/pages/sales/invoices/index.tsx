import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Invoice = { id: number; invoice_number: string; status: string; total_cents: number; currency: string; issued_at?: string | null; due_at?: string | null };

export default function InvoicesIndex({ invoices = { data: [] as Invoice[] } }: { invoices: { data: Invoice[] } }) {
    const items = invoices.data ?? [];
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales/orders' }, { title: 'Invoices', href: '/sales/invoices' }]}>
            <Head title="Invoices" />
            <div className="flex items-center justify-between p-4 md:p-6">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">Invoices</h1>
                    <p className="text-sm text-muted-foreground">Billing documents for your orders.</p>
                </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm">No invoices yet</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">Invoices will appear here once generated.</CardContent>
                    </Card>
                )}
                {items.map((inv) => (
                    <Card key={inv.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="truncate text-sm">{inv.invoice_number}</CardTitle>
                            <Badge variant="secondary">{inv.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{inv.currency} {(inv.total_cents / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Issued</span>
                                <span className="font-medium">{inv.issued_at || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Due</span>
                                <span className="font-medium">{inv.due_at || '—'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}

