import { StatCard, StatGrid } from '@/components/admin';
import { CreditCard, Package, ShoppingBag, Users, type LucideIcon } from 'lucide-react';

export interface Kpi {
    label: string;
    value: string;
    delta?: string;
    trend?: 'up' | 'down' | 'flat';
    icon?: string;
}

// The controller sends icon names as strings.
const ICONS: Record<string, LucideIcon> = { CreditCard, ShoppingBag, Users, Package };

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
    return (
        <StatGrid>
            {kpis.map((kpi) => (
                <StatCard
                    key={kpi.label}
                    label={kpi.label}
                    value={kpi.value}
                    delta={kpi.delta}
                    trend={kpi.trend}
                    icon={kpi.icon ? ICONS[kpi.icon] : undefined}
                />
            ))}
        </StatGrid>
    );
}
