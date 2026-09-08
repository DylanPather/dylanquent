import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, TrendingUp, Eye, ThumbsUp } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function BlogIndex() {
    const { posts, stats } = usePage().props as any;

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
            { title: 'Blog', href: '/cms/blog' }
        ]}>
            <Head title="Blog" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Blog</h1>
                        <p className="text-sm text-muted-foreground">Manage blog posts and articles</p>
                    </div>
                    <Link href={route('cms.blog.create')}>
                        <Button className="gap-2 h-11">
                            <Plus className="w-5 h-5" />
                            New Post
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Posts', value: stats.total_posts, icon: BookOpen, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Published', value: stats.published, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Drafts', value: stats.drafts, icon: BookOpen, color: 'bg-amber-50 text-amber-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Posts Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Title</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Author</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> Views
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold flex items-center gap-1">
                                        <ThumbsUp className="w-4 h-4" /> Likes
                                    </TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post: any) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-bold">{post.title}</TableCell>
                                        <TableCell>{getStatusBadge(post.status)}</TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">{post.author}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{post.views.toLocaleString()}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{post.likes}</TableCell>
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
