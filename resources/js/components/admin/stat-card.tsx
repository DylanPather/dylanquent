import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from 'lucide-react';
import * as React from 'react';

export function TrendPill({ trend, delta }: { trend?: 'up' | 'down' | 'flat'; delta?: string }) {
    if (!delta) return null;

    const Icon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
    const tone =
        trend === 'up'
            ? 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400'
            : trend === 'down'
              ? 'text-red-700 bg-red-500/10 dark:text-red-400'
              : 'text-muted-foreground bg-muted';

    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', tone)}>
            <Icon className="size-3" aria-hidden />
            {delta}
        </span>
    );
}

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    delta?: string;
    trend?: 'up' | 'down' | 'flat';
    icon?: LucideIcon;
    /** Rendered under the value — a sparkline, caption, or nothing. */
    footer?: React.ReactNode;
    className?: string;
}

/**
 * One KPI tile. Value stays the largest thing in the card at every
 * breakpoint so the number is readable on a phone.
 */
export function StatCard({ label, value, delta, trend, icon: Icon, footer, className }: StatCardProps) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                </div>

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
                    <TrendPill trend={trend} delta={delta} />
                </div>

                {footer}
            </CardContent>
        </Card>
    );
}

/** Responsive KPI grid: 1 col on phones, 2 on tablets, 4 on laptops. */
export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4', className)}>{children}</div>;
}
