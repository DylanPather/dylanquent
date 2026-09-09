import { PageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Construction } from 'lucide-react';

/**
 * Rendered in place of a page component that does not exist yet, instead of
 * crashing. Reached via the resolver fallback in app.tsx.
 */
export default function NotBuilt({ component }: { component?: string }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Not available', href: '#' }]}>
            <Head title="Not available yet" />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <PageHeader title="Not available yet" description="This screen hasn't been built." />
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Construction className="size-6 text-muted-foreground" aria-hidden />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">Nothing here yet</p>
                            <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                The rest of the app works — this particular screen just hasn't been built.
                            </p>
                            {component && (
                                <p className="pt-2 font-mono text-xs text-muted-foreground">{component}</p>
                            )}
                        </div>
                        <Button variant="outline" onClick={() => router.visit('/dashboard')}>
                            Back to dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
