import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Filter,
    Grid2X2,
    List,
    Image as ImageIcon,
    MoreHorizontal,
    Trash2,
    Info,
    Download,
    Copy,
    Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs = [
    { title: 'Catalog', href: '/catalog/products' },
    { title: 'Media Library', href: '/catalog/media' }
];

interface MediaItem {
    name: string;
    url: string;
    size: number;
    type: string;
    alt_text?: string;
}

export default function MediaLibrary({ media }: { media: MediaItem[] }) {
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null);

    const form = useForm({
        name: '',
        alt_text: '',
    });

    const openDetailsSheet = (item: MediaItem) => {
        setSelectedItem(item);
        form.setData({
            name: item.name,
            alt_text: item.alt_text || '',
        });
        setIsSheetOpen(true);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSheetOpen(false);
        // Add form submission logic here if needed
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Media Library" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
                        <p className="text-sm text-muted-foreground">Manage your store's visual assets and product images.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm">
                            <Plus className="mr-2 size-4" />
                            Upload New
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-2 rounded-xl border">
                    <div className="flex items-center gap-2 flex-1 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search assets..." className="pl-9 h-9 text-xs bg-background" />
                        </div>
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter className="mr-2 size-4" />
                            Type
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="border rounded-lg p-0.5 flex items-center bg-background">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid2X2 className="size-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
                    {media.map((item, i) => (
                        <Card key={i} className="group overflow-hidden border-none bg-transparent shadow-none hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer" onClick={() => openDetailsSheet(item)}>
                            <div className="aspect-square rounded-xl bg-muted relative overflow-hidden ring-1 ring-inset ring-black/5">
                                {item.type.startsWith('image/') ? (
                                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.name} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                        <ImageIcon className="size-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                        <Info className="size-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                                                <Share2 className="mr-2 size-4" /> Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.url)}>
                                                <Copy className="mr-2 size-4" /> Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 size-4" /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 size-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="mt-2 flex flex-col items-center">
                                <p className="text-[11px] font-bold truncate w-full text-center">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">{formatSize(item.size)}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl flex flex-col p-0">
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>Asset Details</SheetTitle>
                        <SheetDescription>
                            Edit metadata and view technical properties.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        {selectedItem && (
                            <form id="media-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Preview</h4>
                                    <div className="aspect-video rounded-xl bg-muted overflow-hidden ring-1 ring-black/5 shadow-inner">
                                        <img src={selectedItem.url} className="w-full h-full object-contain" alt={selectedItem.name} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Metadata</h4>
                                    <div className="grid gap-6 p-4 rounded-xl border bg-muted/30">
                                        <div className="grid gap-2">
                                            <Label htmlFor="m-name" className="text-xs font-bold uppercase tracking-wider">File Name</Label>
                                            <Input
                                                id="m-name"
                                                className="h-10 bg-background"
                                                value={form.data.name}
                                                onChange={e => form.setData('name', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="m-alt" className="text-xs font-bold uppercase tracking-wider">Alt Text</Label>
                                            <Textarea
                                                id="m-alt"
                                                className="bg-background min-h-[100px] resize-none"
                                                value={form.data.alt_text}
                                                onChange={e => form.setData('alt_text', e.target.value)}
                                                placeholder="Describe the image for screen readers..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Information</h4>
                                    <div className="grid gap-4 p-4 rounded-xl border bg-muted/30">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium uppercase tracking-wider">Type</span>
                                            <span className="font-bold">{selectedItem.type.toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium uppercase tracking-wider">Weight</span>
                                            <span className="font-bold">{formatSize(selectedItem.size)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium uppercase tracking-wider">Uploaded At</span>
                                            <span className="font-bold uppercase leading-none">Jan 25, 2026</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-background shrink-0 flex-row gap-2">
                        <Button type="submit" form="media-form" className="flex-1 h-11" disabled={form.processing}>
                            Save Metadata
                        </Button>
                        <Button variant="outline" type="button" className="h-11 w-11 p-0" onClick={() => navigator.clipboard.writeText(selectedItem?.url || '')}>
                            <Copy className="size-4" />
                        </Button>
                        <Button variant="destructive" type="button" className="h-11 w-11 p-0">
                            <Trash2 className="size-4" />
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
