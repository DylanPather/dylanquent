import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FlaskConical } from 'lucide-react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage();
    const low = (props as any).alerts?.low_stock?.count ?? 0;
    // Controllers that still return hardcoded figures set this, so the
    // numbers on screen are never mistaken for real store data.
    const sampleData = Boolean((props as any).sampleData);
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {low > 0 && (
                    <div className="px-4 pt-3 md:px-6">
                        <Alert variant="default" className="border-amber-200 bg-amber-50/70">
                            <AlertTriangle className="size-4" />
                            <AlertTitle>Low stock</AlertTitle>
                            <AlertDescription>
                                {low} item{low>1?'s':''} at or below threshold. <a className="underline" href="/inventory/stock">Review stock</a>.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                {sampleData && (
                    <div className="px-4 pt-3 md:px-6">
                        <Alert className="border-violet-300 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/30">
                            <FlaskConical className="size-4" />
                            <AlertTitle>Sample data</AlertTitle>
                            <AlertDescription>
                                The figures on this page are placeholders, not your store's data. This
                                feature isn't wired up yet.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
