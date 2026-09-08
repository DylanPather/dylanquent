import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    BarChart3,
    Filter,
    Plus,
    Download,
    ExternalLink,
    Info,
    CheckCircle2,
    CircleDashed,
    AlertTriangle,
} from 'lucide-react';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

const iconMap = {
    CreditCard,
    ShoppingBag,
    Users,
    Package,
};

const quickActions = [
    { label: 'Open Point of Sale', href: '/sales/pos' },
    { label: 'Create Product', href: '/products/create' },
    { label: 'New Discount', href: '/discounts/create' },
    { label: 'Upload Inventory CSV', href: '/inventory/import' },
];

const lowStock = [
    { sku: 'CAP-BLK-01', name: '5-Panel Cap — Black', stock: 8 },
    { sku: 'SCK-WHT-01', name: 'Crew Socks — White', stock: 12 },
    { sku: 'BLT-LEA-01', name: 'Leather Belt — Tan', stock: 15 },
];

const tasks = [
    { id: 1, title: 'Approve discount campaign for September', state: 'in-progress' },
    { id: 2, title: 'Review supplier quote for denim line', state: 'todo' },
    { id: 3, title: 'Resolve refunds backlog', state: 'blocked' },
    { id: 4, title: 'QA checkout flow A/B test', state: 'done' },
];

const categories = [
    { name: 'Tops', share: 34 },
    { name: 'Outerwear', share: 22 },
    { name: 'Bottoms', share: 28 },
    { name: 'Accessories', share: 16 },
];

// --------- Motion helpers ----------
const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
    }),
};

const cardHover = {
    rest: { y: 0, scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
    hover: {
        y: -4,
        scale: 1.01,
        boxShadow: '0 8px 24px rgba(2,6,23,0.06)',
        transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
};

// --------- UI Bits ----------
const TrendPill = ({ trend, delta }) => {
    const up = trend === 'up';
    return (
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            {up ? (
                <ArrowUpRight className="size-4 text-emerald-600" />
            ) : (
                <ArrowDownRight className="size-4 text-rose-600" />
            )}
            <span className={up ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>
                {delta}
            </span>
            <span>vs last 30 days</span>
        </div>
    );
};

// Simple animated sparkline-ish bars for KPIs
const SparkBars = ({ values = [40, 65, 55, 72, 68, 84, 60] }) => {
    return (
        <div className="mt-3 flex items-end gap-1">
            {values.map((v, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0.4 }}
                    whileInView={{ height: `${v}%`, opacity: 1 }}
                    viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-1.5 rounded bg-muted"
                    style={{ minHeight: '6px' }}
                />
            ))}
        </div>
    );
};

// Animated line chart placeholder
const LineChartPlaceholder = () => {
    const path =
        'M 8 86 C 32 60, 64 70, 88 52 S 144 34, 168 48 S 224 86, 248 70 S 304 36, 328 44 S 384 78, 408 62';
    return (
        <svg viewBox="0 0 416 100" className="h-full w-full">
            <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopOpacity="0.15" />
                    <stop offset="100%" stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            <motion.path
                d={`${path} L 408 100 L 8 100 Z`}
                fill="url(#grad)"
                className="text-slate-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
            />
        </svg>
    );
};

// Animated donut chart placeholder
const DonutPlaceholder = ({ percent = 62 }) => {
    const size = 120;
    const stroke = 12;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (percent / 100) * c;

    return (
        <div className="flex h-full items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} className="text-muted" fill="transparent" opacity="0.25" />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-slate-500"
                    fill="transparent"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${c}` }}
                    whileInView={{ strokeDasharray: `${dash} ${c - dash}` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-current text-sm">
                    {percent}%
                </text>
            </svg>
        </div>
    );
};

// Traffic cards with animated meters
const StatMeter = ({ label, value = 72 }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}%</span>
        </div>
        <motion.div
            className="h-2 w-full overflow-hidden rounded bg-muted"
            initial={{ opacity: 0.6 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            <motion.div
                className="h-2 rounded bg-foreground/80"
                initial={{ width: 0 }}
                whileInView={{ width: `${value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            />
        </motion.div>
    </div>
);

// Motion wrapper for shadcn Card
const MotionCard = ({ children, className = '', ...rest }) => (
    <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px -5% 0px' }}
        className={`will-change-transform ${className}`}
        {...rest}
    >
        <motion.div variants={cardHover} initial="rest" whileHover="hover" animate="rest">
            <Card className="rounded-xl transition-colors">{children}</Card>
        </motion.div>
    </motion.div>
);

export default function Dashboard() {
    const { kpis: kpisData, topProducts, recentOrders, lowStock, period } = usePage().props as any;

    const scrollYProgress = useScroll();
    const progress = useSpring(scrollYProgress.scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Scroll progress (top) */}
            <motion.div
                style={{ scaleX: progress, transformOrigin: '0% 50%' }}
                className="fixed inset-x-0 top-0 z-50 h-1 bg-foreground/80"
            />

            <motion.div
                initial="hidden"
                animate="show"
                className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6"
            >
                {/* Top Row: Filters + Actions */}
                <motion.div variants={fadeUp}>
                    <motion.div variants={cardHover} initial="rest" whileHover="hover" animate="rest">
                        <Card className="rounded-xl">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">Live</Badge>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <BarChart3 className="size-4" />
                                            <span className="text-sm">Store Health Overview</span>
                                        </div>
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="range" className="sr-only">
                                                Range
                                            </Label>
                                            <Select defaultValue="last_30">
                                                <SelectTrigger id="range" className="w-[160px]">
                                                    <SelectValue placeholder="Range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="today">Today</SelectItem>
                                                    <SelectItem value="last_7">Last 7 days</SelectItem>
                                                    <SelectItem value="last_30">Last 30 days</SelectItem>
                                                    <SelectItem value="mtd">MTD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="outline">
                                                <Filter className="mr-2 size-4" />
                                                Filters
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button>
                                                <Download className="mr-2 size-4" />
                                                Export
                                            </Button>
                                            <Button variant="secondary">
                                                <Plus className="mr-2 size-4" />
                                                Quick Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* KPI Row */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpisData?.map((kpi: any, idx: number) => {
                        const IconComponent = iconMap[kpi.icon as keyof typeof iconMap] || Package;
                        return (
                            <motion.div key={kpi.label} custom={idx} variants={fadeUp}>
                                <motion.div variants={cardHover} initial="rest" whileHover="hover" animate="rest">
                                    <Card className="rounded-xl">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                                                    <motion.p
                                                        className="mt-2 text-2xl font-semibold"
                                                        initial={{ opacity: 0, y: 4 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.4 }}
                                                    >
                                                        {kpi.value}
                                                    </motion.p>
                                                </div>
                                                <div className="rounded-md border bg-card p-2">
                                                    <IconComponent className="size-5 text-muted-foreground" />
                                                </div>
                                            </div>
                                            <TrendPill trend={kpi.trend} delta={kpi.delta} />
                                            <SparkBars />
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </section>

                {/* Tabs: Overview / Sales / Inventory */}
                <Tabs defaultValue="overview" className="mt-2">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                        {/* Charts Row */}
                        <section className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <MotionCard className="aspect-video">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm">Sales Trend (Last 30 Days)</CardTitle>
                                    <Badge variant="outline">Animated</Badge>
                                </CardHeader>
                                <CardContent className="h-[calc(100%-3.5rem)]">
                                    <LineChartPlaceholder />
                                </CardContent>
                            </MotionCard>

                            <MotionCard className="aspect-video">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm">Category Mix</CardTitle>
                                    <Badge variant="outline">Animated</Badge>
                                </CardHeader>
                                <CardContent className="h-[calc(100%-3.5rem)]">
                                    <DonutPlaceholder percent={62} />
                                </CardContent>
                            </MotionCard>

                            <MotionCard className="aspect-video">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm">Traffic & Conversion</CardTitle>
                                    <Badge variant="outline">Animated</Badge>
                                </CardHeader>
                                <CardContent className="flex h-[calc(100%-3.5rem)] flex-col justify-center gap-4">
                                    <StatMeter label="Landing → PDP" value={78} />
                                    <StatMeter label="PDP → Cart" value={44} />
                                    <StatMeter label="Cart → Checkout" value={33} />
                                    <StatMeter label="Checkout → Purchase" value={18} />
                                </CardContent>
                            </MotionCard>
                        </section>

                        {/* Bottom Section: Top Products + Recent Orders + Quick Actions */}
                        <section className="grid gap-4 lg:grid-cols-3">
                            {/* Top Products */}
                            <MotionCard>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm">Top Products</CardTitle>
                                    <a href="/products" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                                        View all
                                    </a>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {topProducts && topProducts.length > 0 ? (
                                        <ul className="divide-y">
                                            {topProducts.map((p: any, i: number) => (
                                                <motion.li
                                                    key={p.sku}
                                                    className="flex items-center justify-between px-4 py-3"
                                                    initial={{ opacity: 0, y: 6 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.35, delay: i * 0.05 }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{p.name}</p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {p.category} • {p.sku}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold">R{p.price.toFixed(2)}</p>
                                                        <p className="text-xs text-muted-foreground">{p.sold} sold</p>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No products sold yet
                                        </div>
                                    )}
                                </CardContent>
                            </MotionCard>

                            {/* Recent Orders */}
                            <MotionCard>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm">Recent Orders</CardTitle>
                                    <a href="/sales/orders" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                                        View all
                                    </a>
                                </CardHeader>
                                <CardContent>
                                    {recentOrders && recentOrders.length > 0 ? (
                                        <div className="max-h-[360px] overflow-auto">
                                            <table className="min-w-full text-left">
                                                <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Order</th>
                                                        <th className="px-4 py-3 font-medium">Customer</th>
                                                        <th className="px-4 py-3 font-medium">Items</th>
                                                        <th className="px-4 py-3 font-medium">Total</th>
                                                        <th className="px-4 py-3 font-medium">Status</th>
                                                        <th className="px-4 py-3 font-medium">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y text-sm">
                                                    {recentOrders.map((o: any, i: number) => (
                                                        <motion.tr
                                                            key={o.id}
                                                            className="hover:bg-muted/40"
                                                            initial={{ opacity: 0, y: 8 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 0.35, delay: i * 0.04 }}
                                                        >
                                                            <td className="px-4 py-3">
                                                                <a
                                                                    className="font-medium underline-offset-2 hover:underline"
                                                                    href={`/sales/orders/${o.id.replace('#', '')}`}
                                                                >
                                                                    {o.id}
                                                                </a>
                                                            </td>
                                                            <td className="px-4 py-3">{o.customer}</td>
                                                            <td className="px-4 py-3">{o.items}</td>
                                                            <td className="px-4 py-3">R{o.total.toFixed(2)}</td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={
                                                                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                                        (o.status === 'Paid'
                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                            : o.status === 'Pending'
                                                                                ? 'bg-amber-50 text-amber-700'
                                                                                : o.status === 'Shipped'
                                                                                    ? 'bg-blue-50 text-blue-700'
                                                                                    : o.status === 'Delivered'
                                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                                        : 'bg-rose-50 text-rose-700')
                                                                    }
                                                                >
                                                                    <span className="size-1.5 rounded-full bg-current/70" />
                                                                    {o.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">{o.date}</td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No orders yet
                                        </div>
                                    )}
                                </CardContent>
                            </MotionCard>

                            {/* Quick Actions + Accordions */}
                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        {quickActions.map((a, i) => (
                                            <motion.a
                                                key={a.label}
                                                href={a.href}
                                                className="group flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-muted"
                                                whileHover={{ x: 3 }}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, y: 6 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                <span className="font-medium">{a.label}</span>
                                                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </motion.a>
                                        ))}
                                    </div>

                                    {/* Accordions Section */}
                                    <Accordion type="multiple" className="w-full">
                                        <AccordionItem value="insights">
                                            <AccordionTrigger className="text-sm">Insights</AccordionTrigger>
                                            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                                                <div className="flex items-start gap-2">
                                                    <TrendingUp className="mt-0.5 size-4 text-emerald-600" />
                                                    <p>
                                                        Returning customer rate trending up this week. Consider{' '}
                                                        <a href="/discounts/create" className="underline underline-offset-2">
                                                            loyalty codes
                                                        </a>
                                                        .
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Info className="mt-0.5 size-4 text-sky-600" />
                                                    <p>Outerwear conversion dips on mobile. Try a lighter hero image to improve LCP.</p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="tasks">
                                            <AccordionTrigger className="text-sm">Team Tasks</AccordionTrigger>
                                            <AccordionContent className="space-y-2">
                                                {tasks.map((t) => {
                                                    const badge =
                                                        t.state === 'done'
                                                            ? { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 className="size-3" /> }
                                                            : t.state === 'in-progress'
                                                                ? { color: 'text-sky-700', bg: 'bg-sky-50', icon: <CircleDashed className="size-3" /> }
                                                                : t.state === 'blocked'
                                                                    ? { color: 'text-rose-700', bg: 'bg-rose-50', icon: <AlertTriangle className="size-3" /> }
                                                                    : { color: 'text-muted-foreground', bg: 'bg-muted', icon: <CircleDashed className="size-3" /> };

                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                                                        >
                                                            <span className="text-sm">{t.title}</span>
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${badge.bg} ${badge.color}`}
                                                            >
                                                                {badge.icon}
                                                                {t.state}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="notes">
                                            <AccordionTrigger className="text-sm">Notes</AccordionTrigger>
                                            <AccordionContent className="text-sm text-muted-foreground">
                                                Use this dashboard to visualise store health: revenue, orders, inventory, and product performance.
                                                Replace placeholders with real charts, wire orders to your API, and expand actions as you refine your flow.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </MotionCard>
                        </section>
                    </TabsContent>

                    {/* SALES */}
                    <TabsContent value="sales" className="mt-4 space-y-4">
                        <section className="grid gap-4 md:grid-cols-3">
                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Sales Funnel</CardTitle>
                                    <CardDescription>Sessions → PDP → Cart → Checkout</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Sessions', value: 100 },
                                            { label: 'Product Views', value: 62 },
                                            { label: 'Add to Cart', value: 28 },
                                            { label: 'Checkout', value: 14 },
                                            { label: 'Purchases', value: 9 },
                                        ].map((s, i) => (
                                            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }}>
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span>{s.label}</span>
                                                    <span className="text-muted-foreground">{s.value}%</span>
                                                </div>
                                                <Progress value={s.value} className="h-2" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </MotionCard>

                            <MotionCard>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm">Category Mix</CardTitle>
                                        <CardDescription>Share of revenue</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <ExternalLink className="size-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {categories.map((c, i) => (
                                        <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span>{c.name}</span>
                                                <span className="text-muted-foreground">{c.share}%</span>
                                            </div>
                                            <Progress value={c.share} className="h-2" />
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </MotionCard>

                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Search & Filters (stub)</CardTitle>
                                    <CardDescription>Narrow results quickly</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="q">Query</Label>
                                        <Input id="q" placeholder="Search orders, customers…" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <Select defaultValue="any">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any</SelectItem>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="refunded">Refunded</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Channel</Label>
                                            <Select defaultValue="web">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="web">Web</SelectItem>
                                                    <SelectItem value="mobile">Mobile</SelectItem>
                                                    <SelectItem value="pos">POS</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button>Apply</Button>
                                        <Button variant="outline">Reset</Button>
                                    </div>
                                </CardContent>
                            </MotionCard>
                        </section>
                    </TabsContent>

                    {/* INVENTORY */}
                    <TabsContent value="inventory" className="mt-4 space-y-4">
                        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Low Stock Alerts</CardTitle>
                                    <CardDescription>Reorder recommended</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {lowStock && lowStock.length > 0 ? (
                                        lowStock.map((item: any, i: number) => (
                                            <motion.div
                                                key={item.sku}
                                                className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                                                initial={{ opacity: 0, y: 6 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm">{item.name}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{item.sku}</p>
                                                </div>
                                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Stock: {item.stock}</Badge>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            No low stock alerts
                                        </div>
                                    )}
                                </CardContent>
                                {lowStock && lowStock.length > 0 && (
                                    <CardFooter className="justify-end">
                                        <Button variant="outline">Generate PO</Button>
                                    </CardFooter>
                                )}
                            </MotionCard>

                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Aging Inventory</CardTitle>
                                    <CardDescription>SKUs idle less than 90 days</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>OVR-HDY-NVY — 94 days</li>
                                        <li>JKT-BMBR-OLV — 101 days</li>
                                        <li>TS-RLX-GRN — 118 days</li>
                                        <li>BLT-LEA-01 — 122 days</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="justify-end">
                                    <Button>Discount & Promote</Button>
                                </CardFooter>
                            </MotionCard>

                            <MotionCard>
                                <CardHeader>
                                    <CardTitle className="text-sm">Supplier Lead Times</CardTitle>
                                    <CardDescription>Planning window</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { name: 'Denim Co.', days: 21 },
                                        { name: 'Outerwear Ltd.', days: 35 },
                                        { name: 'Basics Collective', days: 12 },
                                    ].map((s, i) => (
                                        <motion.div key={s.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span>{s.name}</span>
                                                <span className="text-muted-foreground">{s.days} days</span>
                                            </div>
                                            <Progress value={Math.min((s.days / 40) * 100, 100)} className="h-2" />
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </MotionCard>
                        </section>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </AppLayout>
    );
}