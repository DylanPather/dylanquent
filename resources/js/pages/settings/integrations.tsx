import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    ShoppingCart,
    BarChart3,
    Mail,
    Zap,
    MessageSquare,
} from 'lucide-react';

export default function Integrations() {
    const { integrations } = usePage().props as any;

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'CreditCard': CreditCard,
            'ShoppingCart': ShoppingCart,
            'BarChart3': BarChart3,
            'Mail': Mail,
            'Zap': Zap,
            'MessageSquare': MessageSquare,
        };
        const Icon = icons[iconName] || Zap;
        return <Icon className="w-8 h-8" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected':
                return <Badge className="bg-emerald-50 text-emerald-700">Connected</Badge>;
            case 'not_connected':
                return <Badge className="bg-gray-50 text-gray-700">Not Connected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Settings', href: '/settings' },
            { title: 'Integrations', href: '/settings/integrations' }
        ]}>
            <Head title="Integrations" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-6xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Integrations</h1>
                    <p className="text-sm text-muted-foreground">Connect third-party services and extend functionality</p>
                </div>

                {/* Integrations Grid */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((integration: any) => (
                        <Card key={integration.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            {getIconComponent(integration.icon)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{integration.name}</h3>
                                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    {getStatusBadge(integration.status)}
                                </div>

                                <Button
                                    className="w-full h-9"
                                    variant={integration.status === 'connected' ? 'outline' : 'default'}
                                >
                                    {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
