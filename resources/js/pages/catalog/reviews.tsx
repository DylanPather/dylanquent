import * as React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Star,
    Search,
    Filter,
    MessageSquareMore,
    Clock,
    MoreHorizontal,
    ThumbsUp,
    Check,
    X,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Reviews', href: '/catalog/reviews' }
];

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    is_visible: boolean;
    user?: {
        name: string;
    } | null;
    product?: {
        name: string;
    } | null;
}

export default function Reviews({ reviews }: { reviews: Review[] }) {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [editingReview, setEditingReview] = React.useState<Review | null>(null);

    const form = useForm({
        rating: 5,
        comment: '',
        is_visible: true as boolean,
    });

    const openEditSheet = (review: Review) => {
        setEditingReview(review);
        form.setData({
            rating: review.rating,
            comment: review.comment || '',
            is_visible: review.is_visible,
        });
        setIsSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReview) {
            form.put(route('catalog.reviews.update', editingReview.id), {
                onSuccess: () => setIsSheetOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this review?')) {
            form.delete(route('catalog.reviews.destroy', id));
        }
    };

    const toggleVisibility = (review: Review) => {
        router.put(route('catalog.reviews.update', review.id), {
            ...review,
            is_visible: !review.is_visible
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Reviews" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
                        <p className="text-sm text-muted-foreground">Monitor and manage customer feedback for your products.</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Average Rating', value: '4.8', sub: '98% Positive', icon: Star, color: 'text-amber-500' },
                        { label: 'Pending Reviews', value: '3', sub: 'Action required', icon: Clock, color: 'text-zinc-500' },
                        { label: 'Helpful Votes', value: '142', sub: 'Total engagement', icon: ThumbsUp, color: 'text-blue-500' },
                        { label: 'Response Rate', value: '92%', sub: 'Target: 100%', icon: MessageSquareMore, color: 'text-primary' },
                    ].map((s, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
                                    <h4 className="text-xl font-bold">{s.value}</h4>
                                    <span className="text-[10px] text-muted-foreground">{s.sub}</span>
                                </div>
                                <div className={`${s.color} bg-muted p-2 rounded-lg`}>
                                    <s.icon className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search reviews..." className="pl-9 h-9 text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 size-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Reviewer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="w-[400px]">Feedback</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8 rounded">
                                                    <AvatarFallback className="text-[10px] font-bold">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{review.product?.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`size-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {review.comment}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={review.is_visible ? 'secondary' : 'outline'} className="text-[10px] font-bold uppercase tracking-wider">
                                                {review.is_visible ? 'Published' : 'Hidden'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditSheet(review)}>
                                                        <MessageSquareMore className="mr-2 size-4" /> Moderate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(review.id)}>
                                                        <Trash2 className="mr-2 size-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>Moderate Review</SheetTitle>
                        <SheetDescription>
                            Review the customer feedback and manage its storefront visibility.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <form id="review-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Context</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Reviewer</span>
                                        <span className="font-bold">{editingReview?.user?.name || 'Anonymous User'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Product</span>
                                        <span className="font-bold">{editingReview?.product?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rating & Content</h4>
                                <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                    <div className="grid gap-2">
                                        <Label htmlFor="rev-rating" className="text-xs font-bold uppercase tracking-wider">Customer Rating</Label>
                                        <Select
                                            value={form.data.rating.toString()}
                                            onValueChange={val => form.setData('rating', parseInt(val))}
                                        >
                                            <SelectTrigger id="rev-rating" className="h-10 bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 4, 3, 2, 1].map(r => (
                                                    <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="rev-comment" className="text-xs font-bold uppercase tracking-wider">Feedback Content</Label>
                                        <Textarea
                                            id="rev-comment"
                                            className="bg-background min-h-[160px] resize-none"
                                            value={form.data.comment || ''}
                                            onChange={e => form.setData('comment', e.target.value)}
                                            placeholder="User feedback text..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Moderation</h4>
                                <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="rev-visible"
                                            checked={form.data.is_visible}
                                            onCheckedChange={(checked) => form.setData('is_visible', !!checked)}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="rev-visible" className="text-sm font-bold">Public Visibility</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Display this review to customers on the product page</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0">
                        <Button type="submit" form="review-form" className="w-full h-11" disabled={form.processing}>
                            Save Changes
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
