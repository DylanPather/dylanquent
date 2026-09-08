import * as React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    User,
    CreditCard,
    Banknote,
    ShoppingCart,
    ScanBarcode,
    TicketPercent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for demo
const PRODUCTS = [
    { id: 1, name: 'Classic Tee — Black', sku: 'TS-CLASSIC-BLK', price: 199.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Oversized Hoodie — Grey', sku: 'HDY-OVR-GRY', price: 499.00, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Slim Jeans — Dark Blue', sku: 'JNS-SLIM-DB', price: 599.00, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Crewneck — White', sku: 'CRW-NECK-WHT', price: 350.00, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=60' },
    { id: 5, name: '5-Panel Cap — Black', sku: 'CAP-BLK-01', price: 150.00, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=60' },
    { id: 6, name: 'Leather Belt — Tan', sku: 'BLT-LEA-01', price: 299.00, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=60' },
];

const breadcrumbs = [{ title: 'Sales', href: '/sales/orders' }, { title: 'POS', href: '/sales/pos' }];

export default function PointOfSale() {
    const [cart, setCart] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [customer, setCustomer] = React.useState<string | null>(null);

    const filteredProducts = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point of Sale" />

            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden lg:flex-row">

                {/* Product Section */}
                <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products or scan barcode..."
                                className="pl-9 h-11 rounded-xl bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                            <ScanBarcode className="size-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -4 }}
                                    onClick={() => addToCart(product)}
                                    className="group cursor-pointer"
                                >
                                    <Card className="overflow-hidden border-0 bg-background hover:ring-2 ring-primary/20 transition-all rounded-2xl">
                                        <div className="aspect-square overflow-hidden relative">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="object-cover w-full h-full transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                        </div>
                                        <div className="p-3 space-y-1">
                                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-primary font-semibold">R {product.price.toFixed(2)}</p>
                                                <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Cart Section */}
                <div className="w-full lg:w-96 border-l bg-muted/30 flex flex-col shrink-0">
                    <div className="p-4 border-b flex items-center justify-between bg-background">
                        <div className="flex items-center gap-2 font-semibold">
                            <ShoppingCart className="size-4" />
                            Current Sale
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                            {cart.length} items
                        </Badge>
                    </div>

                    <div className="p-4 flex flex-col gap-2">
                        <Button variant="outline" className="w-full justify-start h-10 rounded-xl bg-background border-dashed">
                            <User className="mr-2 size-4" />
                            {customer || 'Add Customer'}
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-3 pb-4">
                            <AnimatePresence mode="popLayout">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-background rounded-xl p-3 border shadow-sm group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium truncate">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground">R {item.price.toFixed(2)}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center bg-muted rounded-lg p-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 h-7"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 h-7"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus className="size-3" />
                                                </Button>
                                            </div>
                                            <p className="font-semibold text-sm">R {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {cart.length === 0 && (
                                <div className="py-20 flex flex-col items-center gap-2 text-muted-foreground opacity-50">
                                    <ShoppingCart className="size-10" />
                                    <p className="text-sm">Empty cart</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-background border-t space-y-4 shadow-2xl">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>R {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (15%)</span>
                                <span>R {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary text-xs font-medium cursor-pointer hover:underline">
                                <TicketPercent className="size-3.5" />
                                Add Discount Code
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>R {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="outline" className="h-14 rounded-2xl flex-col gap-1 text-xs font-normal">
                                <Banknote className="size-5" />
                                Cash
                            </Button>
                            <Button className="h-14 rounded-2xl flex-col gap-1 text-xs font-normal">
                                <CreditCard className="size-5" />
                                Card
                            </Button>
                        </div>
                        <Button
                            className="w-full h-12 rounded-2xl font-semibold shadow-lg shadow-primary/20"
                            disabled={cart.length === 0}
                        >
                            Complete Transaction
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
