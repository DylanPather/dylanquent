import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, Truck, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import AppLayout from '../../../layouts/app-layout';

interface OrderData {
    order: {
        id: number;
        order_number: string;
        status: string;
        subtotal_cents: number;
        discount_total_cents: number;
        tax_total_cents: number;
        shipping_total_cents: number;
        total_cents: number;
        currency: string;
        payment_gateway?: string;
        payment_status?: string;
        payment_id?: string;
        tracking_number?: string;
        placed_at: string;
        shipped_at?: string;
        updated_at: string;
        notes?: string;
        customer: {
            id: number;
            name: string;
            email: string;
            phone?: string;
        };
        billing_address: Record<string, string>;
        shipping_address: Record<string, string>;
        items: Array<{
            id: number;
            product_id: number;
            name: string;
            quantity: number;
            unit_price_cents: number;
            total_cents: number;
        }>;
    };
    availableStatuses: string[];
    availableCarriers: Record<string, string>;
}

export default function OrderShow() {
    const { order, availableStatuses, availableCarriers } = usePage().props as any as OrderData;
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [carrier, setCarrier] = useState('usps');
    const [isShipping, setIsShipping] = useState(false);
    const [newStatus, setNewStatus] = useState(order.status);

    const handleMarkShipped = async () => {
        setIsShipping(true);
        router.post(route('sales.orders.mark-shipped', order.id), {
            carrier,
            tracking_number: trackingNumber,
        }, {
            onFinish: () => setIsShipping(false),
        });
    };

    const handleRefund = async () => {
        router.post(route('sales.orders.refund', order.id), {});
        setShowRefundConfirm(false);
    };

    const handleStatusChange = async (status: string) => {
        router.post(route('sales.orders.update-status', order.id), {
            status,
            notes: order.notes,
        });
        setShowStatusMenu(false);
    };

    // One entry per App\Enums\OrderStatus case. 'shipped' used to sit here
    // beside 'fulfilled'; it was never a status the orders table accepted.
    const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
        payment_failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: XCircle },
        paid: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: CheckCircle },
        processing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', icon: Package },
        fulfilled: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: Truck },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: XCircle },
        refunded: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', icon: AlertCircle },
        partially_refunded: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', icon: AlertCircle },
    };

    const StatusIcon = statusColors[order.status]?.icon || AlertCircle;

    return (
        <AppLayout breadcrumbs={[{ label: 'Orders', href: route('sales.orders.index') }, { label: `Order #${order.order_number}` }]}>
            <div className="max-w-6xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">Order #{order.order_number}</h1>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                                <StatusIcon className="size-4" />
                                <span className="text-sm font-semibold uppercase tracking-wide">{order.status}</span>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Placed on {new Date(order.placed_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Link href={route('sales.orders.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h2 className="font-bold text-lg">Order Items</h2>
                            </div>
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{order.currency} {(item.unit_price_cents / 100).toFixed(2)}</p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total: {order.currency} {(item.total_cents / 100).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Status */}
                        {order.status === 'paid' && !order.shipped_at && (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                                <h3 className="font-bold mb-4">Ship This Order</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Carrier</label>
                                        <select
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-foreground"
                                        >
                                            {Object.entries(availableCarriers).map(([key, name]) => (
                                                <option key={key} value={key}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Tracking Number</label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="e.g., TRACK123456"
                                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-foreground"
                                        />
                                    </div>
                                    <button
                                        onClick={handleMarkShipped}
                                        disabled={isShipping}
                                        className="w-full bg-foreground text-background py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isShipping ? 'Processing...' : '✓ Mark as Shipped'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Billing Address */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="font-bold mb-4">Billing Address</h3>
                            <div className="text-sm space-y-1 text-zinc-700 dark:text-zinc-300">
                                <p>{order.billing_address?.name}</p>
                                <p>{order.billing_address?.street}</p>
                                <p>{order.billing_address?.city}, {order.billing_address?.state} {order.billing_address?.zip}</p>
                                <p>{order.billing_address?.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Total */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="font-bold mb-4">Order Total</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                    <span>{order.currency} {(order.subtotal_cents / 100).toFixed(2)}</span>
                                </div>
                                {order.tax_total_cents > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Tax</span>
                                        <span>{order.currency} {(order.tax_total_cents / 100).toFixed(2)}</span>
                                    </div>
                                )}
                                {order.shipping_total_cents > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                                        <span>{order.currency} {(order.shipping_total_cents / 100).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{order.currency} {(order.total_cents / 100).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="font-bold mb-4">Customer</h3>
                            <div className="text-sm space-y-2">
                                <p className="font-semibold">{order.customer.name}</p>
                                <p className="text-zinc-600 dark:text-zinc-400">{order.customer.email}</p>
                                {order.customer.phone && <p className="text-zinc-600 dark:text-zinc-400">{order.customer.phone}</p>}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <h3 className="font-bold mb-4">Payment</h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-400">Method</span>
                                    <span className="font-semibold capitalize">{order.payment_gateway || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                                    <span className="font-semibold capitalize">{order.payment_status || 'Pending'}</span>
                                </div>
                            </div>

                            {order.payment_status === 'paid' && (
                                <button
                                    onClick={() => setShowRefundConfirm(true)}
                                    className="w-full mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50"
                                >
                                    Refund Order
                                </button>
                            )}
                        </div>

                        {/* Shipping Info */}
                        {order.tracking_number && (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                                <h3 className="font-bold mb-4">Tracking</h3>
                                <p className="font-mono text-sm font-semibold bg-zinc-100 dark:bg-zinc-900 p-3 rounded break-all">
                                    {order.tracking_number}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Refund Confirmation Modal */}
                {showRefundConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md">
                            <h3 className="text-lg font-bold mb-2">Confirm Refund</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                Are you sure you want to refund {order.currency} {(order.total_cents / 100).toFixed(2)}? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRefundConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRefund}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                >
                                    Refund
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
