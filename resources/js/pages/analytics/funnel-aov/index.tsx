import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
    Zap,
    TrendingUp,
    ShoppingCart,
    DollarSign,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function FunnelAOVIndex() {
    const { funnel, stats, daily_aov } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Analytics', href: '/analytics' },
            { title: 'Funnel & AOV', href: '/analytics/funnel-aov' }
        ]}>
            <Head title="Funnel & AOV" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Funnel & AOV</h1>
                    <p className="text-sm text-muted-foreground">Track conversion funnel and average order value</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Conversion Rate', value: stats.conversion_rate, icon: Zap, color: 'bg-blue-50 text-blue-700' },
                        { label: 'AOV', value: `R${stats.avg_order_value.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Cart Abandonment', value: stats.cart_abandonment, icon: ShoppingCart, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Avg Cart Value', value: `R${stats.avg_cart_value.toFixed(2)}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Funnel */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold mb-6">Conversion Funnel</h2>
                        <div className="space-y-4">
                            {funnel.map((stage: any, index: number) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-full">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold text-sm">{stage.stage}</span>
                                            <span className="text-sm text-muted-foreground">{stage.count.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-muted rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full"
                                                style={{ width: `${(parseFloat(stage.conversion) / 100) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{stage.conversion}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AOV Trend */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold mb-6">Average Order Value Trend</h2>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {daily_aov.map((day: any, index: number) => {
                                const maxAOV = Math.max(...daily_aov.map((d: any) => d.aov));
                                const percentage = (day.aov / maxAOV) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-emerald-600 rounded-t"
                                            style={{ height: `${percentage}%`, minHeight: '4px' }}
                                        ></div>
                                        <span className="text-xs text-muted-foreground text-center">{day.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
