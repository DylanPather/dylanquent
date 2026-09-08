import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, TrendingUp, Eye } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function PagesIndex() {
    const { pages, stats } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-emerald-50 text-emerald-700">Published</Badge>;
            case 'draft':
                return <Badge className="bg-amber-50 text-amber-700">Draft</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Content', href: '/cms' },
            { title: 'Pages', href: '/cms/pages' }
        ]}>
            <Head title="Pages" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Pages</h1>
                        <p className="text-sm text-muted-foreground">Create and manage static pages</p>
                    </div>
                    <Link href={route('cms.pages.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Page
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Pages', value: stats.total_pages, icon: FileText, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Published', value: stats.published, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Drafts', value: stats.drafts, icon: FileText, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pages Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Title</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Slug</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Views</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Author</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pages.map((page: any) => (
                                    <TableRow key={page.id}>
                                        <TableCell className="font-bold">{page.title}</TableCell>
                                        <TableCell>{getStatusBadge(page.status)}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{page.slug}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{page.views}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{page.author}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
