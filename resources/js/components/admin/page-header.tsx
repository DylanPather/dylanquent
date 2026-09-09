import { cn } from '@/lib/utils';
import * as React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Buttons, filters — wraps below the title on narrow screens. */
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Consistent page title block for every admin screen.
 * Stacks on phones, sits inline from `sm` up.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="min-w-0 space-y-1">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
