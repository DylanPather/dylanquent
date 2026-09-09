import { PageHeader } from '@/components/admin';
import { KpiGrid, type Kpi } from '@/components/dashboard/kpi-grid';
import {
    LowStock,
    QuickActions,
    RecentOrders,
    TopProducts,
    type LowStockItem,
    type RecentOrder,
    type TopProduct,
} from '@/components/dashboard/panels';
import { PeriodFilter } from '@/components/dashboard/period-filter';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

interface DashboardProps {
    kpis: Kpi[];
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
    lowStock: LowStockItem[];
    period: string;
}

const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard() {
    const { kpis, topProducts, recentOrders, lowStock, period } = usePage().props as unknown as DashboardProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <PageHeader
                    title="Dashboard"
                    description="How the store is performing right now."
                    actions={<PeriodFilter value={period ?? 'last_30'} />}
                />

                <KpiGrid kpis={kpis ?? []} />

                {/* Orders get the wider column on laptops; supporting panels stack beside it. */}
                <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <RecentOrders orders={recentOrders ?? []} />
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <LowStock items={lowStock ?? []} />
                        <QuickActions />
                    </div>
                </div>

                <TopProducts products={topProducts ?? []} />
            </div>
        </AppLayout>
    );
}
