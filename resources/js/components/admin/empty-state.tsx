import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import * as React from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    /** `inline` sits inside a card body; `page` fills a whole screen. */
    variant?: 'inline' | 'page';
}

/**
 * Shown wherever a list can legitimately be empty. A blank table with no
 * explanation reads as a bug; this says which it is.
 */
export function EmptyState({ icon: Icon, title, description, action, className, variant = 'inline' }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 text-center',
                variant === 'page' ? 'py-16 sm:py-24' : 'py-10 sm:py-12',
                className,
            )}
        >
            {Icon && (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                </div>
            )}
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                {description && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>}
            </div>
            {action}
        </div>
    );
}
