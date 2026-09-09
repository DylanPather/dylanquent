import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: 'last_7', label: 'Last 7 days' },
    { value: 'last_30', label: 'Last 30 days' },
    { value: 'last_90', label: 'Last 90 days' },
    { value: 'year', label: 'This year' },
];

/**
 * The old filter had no change handler, so the controller's `period`
 * argument was never actually sent. This reloads the page props.
 */
export function PeriodFilter({ value }: { value: string }) {
    return (
        <Select
            value={value}
            onValueChange={(period) =>
                router.get('/dashboard', { period }, { preserveState: true, preserveScroll: true, replace: true })
            }
        >
            <SelectTrigger className="w-full sm:w-[170px]" aria-label="Reporting period">
                <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
                {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                        {p.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
