import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface DataCardProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** Removes body padding so tables can sit flush against the edges. */
    flush?: boolean;
}

/** Card with a consistent header, used for every panel on an admin page. */
export function DataCard({ title, description, action, children, className, flush }: DataCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </CardHeader>
            <CardContent className={cn(flush && 'px-0 pb-0')}>{children}</CardContent>
        </Card>
    );
}
