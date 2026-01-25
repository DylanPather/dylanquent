import * as React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Globe,
    Save,
    ShieldCheck,
    LineChart,
    Search,
    Share2,
    RefreshCcw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'SEO & Metadata', href: '/catalog/seo' }
];

export default function SeoMeta() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SEO & Metadata" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">SEO & Metadata</h1>
                        <p className="text-sm text-muted-foreground">Optimize how your store appears in search engines and social media.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <RefreshCcw className="mr-2 size-4" />
                            Force Index
                        </Button>
                        <Button size="sm">
                            <Save className="mr-2 size-4" />
                            Save Rules
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { title: 'SEO Health', value: '94/100', icon: ShieldCheck, color: 'text-emerald-600' },
                        { title: 'Indexed Pages', value: '142', icon: Globe, color: 'text-blue-600' },
                        { title: 'Organic Reach', value: '+18.4%', icon: LineChart, color: 'text-primary' },
                    ].map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                                    <h4 className="text-lg font-bold">{stat.value}</h4>
                                </div>
                                <div className={`${stat.color} bg-muted p-2 rounded-lg`}>
                                    <stat.icon className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Search className="size-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Search Engine Presence</h3>
                        </div>
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="site_title" className="text-xs font-bold">Global Site Title</Label>
                                        <Input id="site_title" defaultValue="Dylanquent — Minimalist Streetwear" />
                                        <p className="text-[10px] text-muted-foreground">Recommended: 50-60 characters.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title_suffix" className="text-xs font-bold">Title Suffix</Label>
                                        <Input id="title_suffix" defaultValue="| Dylanquent Studio" />
                                        <p className="text-[10px] text-muted-foreground">Appended to product/page titles.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keywords" className="text-xs font-bold">Primary Keywords</Label>
                                    <Textarea id="keywords" rows={2} defaultValue="streetwear, minimalist, dylanquent, anime, essential" />
                                    <p className="text-[10px] text-muted-foreground">Comma-separated list of target keywords.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-bold">Meta Description</Label>
                                    <Textarea id="description" rows={3} defaultValue="Experimental minimalist streetwear from Dylanquent. High-fidelity builds, limited drops, and intentional design." />
                                    <p className="text-[10px] text-muted-foreground">The summary displayed in search results.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Share2 className="size-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Social Sharing (Open Graph)</h3>
                        </div>
                        <Card>
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-64 aspect-video bg-muted rounded-lg flex items-center justify-center border relative overflow-hidden group">
                                    <ImageIcon className="size-8 text-muted-foreground/30" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="sm" variant="secondary" className="text-[10px] font-bold">Edit Image</Button>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold">Default Share Image</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                            This image appears when your store is shared on platforms like X, Facebook, and Slack.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Upload New</Button>
                                        <Button variant="ghost" size="sm" className="text-xs">Browse Media</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function ImageIcon({ className }: { className?: string }) {
    return <Globe className={className} />;
}
