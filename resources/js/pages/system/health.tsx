import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TrafficPoint = { date: string; requests: number; avg_duration_ms: number };

export default function SystemHealth({ windowDays = 7, traffic = [] as TrafficPoint[] }: { windowDays: number; traffic: TrafficPoint[] }) {
    const maxReq = Math.max(1, ...traffic.map(t => t.requests));
    return (
        <AppLayout breadcrumbs={[{ title: 'System', href: '/system/health' }, { title: 'Health', href: '/system/health' }]}>
            <Head title="System Health" />
            <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Requests (last {windowDays} days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                            {traffic.map((t) => (
                                <div key={t.date} className="flex flex-col items-center gap-1">
                                    <div className="h-24 w-4 overflow-hidden rounded bg-muted">
                                        <div className="h-full w-full rounded bg-foreground/70" style={{ height: `${(t.requests / maxReq) * 100}%` }} />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{t.date.slice(5)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Avg latency (ms)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm">
                            {traffic.map((t) => (
                                <li key={t.date} className="flex items-center justify-between border-b py-1">
                                    <span className="text-muted-foreground">{t.date}</span>
                                    <span className="font-medium">{t.avg_duration_ms}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

