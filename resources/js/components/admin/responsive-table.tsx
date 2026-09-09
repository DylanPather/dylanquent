import { cn } from '@/lib/utils';
import * as React from 'react';

export interface Column<T> {
    /** Header label. */
    header: string;
    /** Cell renderer. */
    cell: (row: T) => React.ReactNode;
    /** Right-align numeric columns. */
    align?: 'left' | 'right';
    /** Hide on phones — the stacked view shows it as a labelled row instead. */
    hideOnMobile?: boolean;
    /** Treated as the card title in the stacked mobile view. */
    primary?: boolean;
    className?: string;
}

interface ResponsiveTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T, index: number) => string | number;
    onRowClick?: (row: T) => void;
    empty?: React.ReactNode;
    className?: string;
}

/**
 * A table on tablets and laptops; a stack of labelled cards on phones.
 *
 * Horizontally scrolling tables are the usual shortcut, but they hide
 * columns off-screen with no affordance. Below `md` each row becomes a
 * card with its own field labels instead.
 */
export function ResponsiveTable<T>({ columns, rows, rowKey, onRowClick, empty, className }: ResponsiveTableProps<T>) {
    if (!rows.length) return <>{empty}</>;

    const primary = columns.find((c) => c.primary) ?? columns[0];
    const rest = columns.filter((c) => c !== primary);

    return (
        <div className={className}>
            {/* Tablet and up */}
            <div className="hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead>
                            <tr className="border-b">
                                {columns.map((c) => (
                                    <th
                                        key={c.header}
                                        scope="col"
                                        className={cn(
                                            'px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase',
                                            c.align === 'right' ? 'text-right' : 'text-left',
                                        )}
                                    >
                                        {c.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr
                                    key={rowKey(row, i)}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={cn(
                                        'border-b last:border-0',
                                        onRowClick && 'cursor-pointer transition-colors hover:bg-muted/50',
                                    )}
                                >
                                    {columns.map((c) => (
                                        <td
                                            key={c.header}
                                            className={cn(
                                                'px-4 py-3 align-middle',
                                                c.align === 'right' && 'text-right tabular-nums',
                                                c.className,
                                            )}
                                        >
                                            {c.cell(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Phones */}
            <ul className="divide-y md:hidden">
                {rows.map((row, i) => (
                    <li
                        key={rowKey(row, i)}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={cn('space-y-2 px-4 py-3', onRowClick && 'cursor-pointer active:bg-muted/50')}
                    >
                        <div className="font-medium">{primary.cell(row)}</div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {rest
                                .filter((c) => !c.hideOnMobile)
                                .map((c) => (
                                    <div key={c.header} className="min-w-0">
                                        <dt className="text-xs text-muted-foreground">{c.header}</dt>
                                        <dd className="truncate text-sm tabular-nums">{c.cell(row)}</dd>
                                    </div>
                                ))}
                        </dl>
                    </li>
                ))}
            </ul>
        </div>
    );
}
