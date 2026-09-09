import { cn } from '@/lib/utils';

/**
 * Small bar sparkline. Decorative, so it is hidden from assistive tech —
 * the number it accompanies carries the meaning.
 */
export function SparkBars({ values, className }: { values: number[]; className?: string }) {
    if (!values?.length) return null;

    const max = Math.max(...values, 1);

    return (
        <div className={cn('flex h-8 items-end gap-1', className)} aria-hidden>
            {values.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm bg-foreground/15 transition-colors"
                    style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
                />
            ))}
        </div>
    );
}
