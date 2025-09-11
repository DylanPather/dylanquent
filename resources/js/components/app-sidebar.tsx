import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ChevronRight,
    LayoutDashboard,
    Gauge,
    BarChart3,
    CheckCheck,
    Boxes,
    Shirt,
    Blocks,
    Tags,
    Package,
    MessageSquareMore,
    Image as ImageIcon,
    Files,
    Brush,
    ShoppingBag,
    ShoppingCart,
    Receipt,
    CreditCard,
    HandCoins,
    CalendarDays,
    Percent,
    ClipboardList,
    Truck,
    Box,
    Building2,
    ListChecks,
    Users,
    Mail,
    Megaphone,
    Cable,
    Flag,
    Warehouse,
    Wrench,
    UserCog,
    LockKeyhole,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import AppLogo from './app-logo';
import { NavUser } from '@/components/nav-user';

/* ----------------------------- Types & Utils ----------------------------- */

type NavItem = {
    title: string;
    href?: string;
    icon?: LucideIcon;
    badge?: string | number;
    external?: boolean;
    disabled?: boolean;
    items?: NavItem[];
};

// Get current path from Inertia
function useCurrentPath() {
    // @ts-ignore – Inertia’s Page has a url string we can rely on
    const { url } = usePage();
    // Inertia url can include query; strip it for active highlighting
    return React.useMemo(() => (typeof url === 'string' ? url.split('?')[0] : window.location.pathname), [url]);
}

function pathMatches(current: string, href?: string) {
    if (!href) return false;
    if (href === '/') return current === '/';
    // highlight parent sections too
    return current === href || current.startsWith(href + '/');
}

/** Recursively find all titles that are ancestors of the active item (including itself) */
function collectActiveChain(items: NavItem[], current: string, chain: string[] = []): string[] {
    for (const item of items) {
        const selfActive = pathMatches(current, item.href);
        if (item.items?.length) {
            const childChain = collectActiveChain(item.items, current, []);
            if (childChain.length) {
                return [item.title, ...childChain];
            }
        }
        if (selfActive) return [item.title];
    }
    return chain;
}

/* --------------------------------- Data ---------------------------------- */

const MAIN_ITEMS: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        items: [
            { title: 'Overview', href: '/dashboard', icon: Gauge },
            { title: 'Sales Snapshot', href: '/dashboard/sales', icon: BarChart3 },
            { title: 'Operations Health', href: '/dashboard/ops', icon: CheckCheck },
        ],
    },

    // Catalog
    {
        title: 'Catalog',
        icon: Boxes,
        items: [
            { title: 'Products', href: '/catalog/products', icon: Shirt },
            { title: 'Collections', href: '/catalog/collections', icon: Blocks },
            { title: 'Categories', href: '/catalog/categories', icon: Tags },
            { title: 'Attributes', href: '/catalog/attributes', icon: ListChecks },
            { title: 'Variants', href: '/catalog/variants', icon: Package },
            { title: 'Reviews', href: '/catalog/reviews', icon: MessageSquareMore, badge: '12' },
            { title: 'Media Library', href: '/catalog/media', icon: ImageIcon },
            { title: 'Bulk Editor', href: '/catalog/bulk', icon: Files },
            { title: 'SEO & Meta', href: '/catalog/seo', icon: Brush },
        ],
    },

    // Sales
    {
        title: 'Sales',
        icon: ShoppingBag,
        items: [
            { title: 'Orders', href: '/sales/orders', icon: ShoppingCart, badge: '7' },
            { title: 'Invoices', href: '/sales/invoices', icon: Receipt },
            { title: 'Payments', href: '/sales/payments', icon: CreditCard },
            { title: 'Refunds', href: '/sales/refunds', icon: HandCoins },
            { title: 'Subscriptions', href: '/sales/subscriptions', icon: CalendarDays },
            {
                title: 'Discounts & Promotions',
                icon: Percent,
                items: [
                    { title: 'Discount Codes', href: '/sales/discounts/codes', icon: Percent },
                    { title: 'Automatic Discounts', href: '/sales/discounts/automatic', icon: Tags },
                    { title: 'Gift Cards', href: '/sales/discounts/gift-cards', icon: CreditCard },
                ],
            },
            { title: 'Abandoned Carts', href: '/sales/abandoned', icon: ClipboardList, badge: '4' },
        ],
    },

    // Fulfillment & Inventory
    {
        title: 'Fulfillment',
        icon: Truck,
        items: [
            { title: 'Pick & Pack', href: '/fulfillment/pick-pack', icon: Boxes },
            { title: 'Shipping Labels', href: '/fulfillment/labels', icon: Truck },
            { title: 'Returns', href: '/fulfillment/returns', icon: Package },
            { title: 'Deliveries', href: '/fulfillment/deliveries', icon: Truck },
            { title: 'Couriers & Rates', href: '/fulfillment/couriers', icon: Truck },
        ],
    },
    {
        title: 'Inventory',
        icon: Warehouse,
        items: [
            { title: 'Stock Levels', href: '/inventory/stock', icon: Box },
            { title: 'Transfers', href: '/inventory/transfers', icon: Truck },
            { title: 'Warehouses', href: '/inventory/warehouses', icon: Building2 },
            { title: 'Purchase Orders', href: '/inventory/pos', icon: Receipt },
            { title: 'Reorder Rules', href: '/inventory/reorder', icon: ListChecks },
        ],
    },

    // Customers & Marketing
    {
        title: 'Customers',
        icon: Users,
        items: [
            { title: 'All Customers', href: '/customers', icon: Users },
            { title: 'Segments', href: '/customers/segments', icon: Tags },
            { title: 'Loyalty & Rewards', href: '/customers/loyalty', icon: Percent },
            { title: 'Support Tickets', href: '/customers/tickets', icon: MessageSquareMore },
            { title: 'RFM Analysis', href: '/customers/rfm', icon: BarChart3 },
        ],
    },
    {
        title: 'Marketing',
        icon: Megaphone,
        items: [
            { title: 'Campaigns', href: '/marketing/campaigns', icon: Flag },
            { title: 'Email', href: '/marketing/email', icon: Mail },
            { title: 'SMS / WhatsApp', href: '/marketing/sms', icon: MessageSquareMore },
            { title: 'On-Site Banners', href: '/marketing/banners', icon: ImageIcon },
            { title: 'Affiliates', href: '/marketing/affiliates', icon: Users },
            { title: 'UTM Tracking', href: '/marketing/utm', icon: Cable },
        ],
    },

    // Content / CMS
    {
        title: 'Content',
        icon: Files,
        items: [
            { title: 'Pages', href: '/content/pages', icon: Files },
            { title: 'Blog', href: '/content/blog', icon: Files },
            { title: 'Navigation', href: '/content/navigation', icon: ChevronRight },
            { title: 'Theme & Branding', href: '/content/theme', icon: Brush },
        ],
    },

    // Analytics & Finance
    {
        title: 'Analytics',
        icon: BarChart3,
        items: [
            { title: 'Sales Reports', href: '/analytics/sales', icon: BarChart3 },
            { title: 'Product Performance', href: '/analytics/products', icon: Shirt },
            { title: 'Customer Insights', href: '/analytics/customers', icon: Users },
            { title: 'Funnel & AOV', href: '/analytics/funnel', icon: Gauge },
            { title: 'Cohorts & LTV', href: '/analytics/cohorts', icon: Users },
        ],
    },
    {
        title: 'Finance',
        icon: Receipt,
        items: [
            { title: 'Payouts', href: '/finance/payouts', icon: HandCoins },
            { title: 'Reconciliation', href: '/finance/reconciliation', icon: Receipt },
            { title: 'Taxes (VAT)', href: '/finance/taxes', icon: Percent },
            { title: 'Expenses', href: '/finance/expenses', icon: CreditCard },
        ],
    },

    // Settings / System
    {
        title: 'Settings',
        icon: Wrench,
        items: [
            { title: 'Store', href: '/settings/store', icon: Building2 },
            { title: 'Sales Channels', href: '/settings/channels', icon: Megaphone },
            { title: 'Staff & Roles', href: '/settings/staff', icon: UserCog },
            { title: 'Payments', href: '/settings/payments', icon: CreditCard },
            { title: 'Shipping', href: '/settings/shipping', icon: Truck },
            { title: 'Integrations', href: '/settings/integrations', icon: Cable },
            { title: 'Locales & Currency', href: '/settings/locales', icon: Flag },
            { title: 'Legal', href: '/settings/legal', icon: Files },
            { title: 'Webhooks & API', href: '/settings/developers', icon: Wrench },
            { title: 'Security', href: '/settings/security', icon: LockKeyhole },
            { title: 'Feature Flags', href: '/settings/features', icon: CheckCheck },
        ],
    },
    {
        title: 'System',
        icon: Wrench,
        items: [
            { title: 'Logs', href: '/system/logs', icon: Files },
            { title: 'Health', href: '/system/health', icon: Gauge },
            { title: 'Background Jobs', href: '/system/jobs', icon: ClipboardList },
        ],
    },
];

const FOOTER_ITEMS: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Files, external: true },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: Files, external: true },
];

/* ------------------------------- Components ------------------------------ */

function Caret({ open }: { open: boolean }) {
    return (
        <ChevronRight
            className={`size-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            aria-hidden="true"
        />
    );
}

function ItemBadge({ badge }: { badge?: string | number }) {
    if (badge == null) return null;
    return (
        <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-700">
            {badge}
        </span>
    );
}

function ItemIcon({ icon: Icon }: { icon?: LucideIcon }) {
    if (!Icon) return <span className="size-4" />;
    return <Icon className="size-4" aria-hidden="true" />;
}

type RecursiveMenuProps = {
    items: NavItem[];
    currentPath: string;
    defaultOpenTitles: string[]; // titles that should start open (active chain)
    level?: number;
};

function RecursiveMenu({ items, currentPath, defaultOpenTitles, level = 0 }: RecursiveMenuProps) {
    // track which groups are open
    const [open, setOpen] = React.useState<Record<string, boolean>>(() =>
        Object.fromEntries(items.map(i => [i.title, defaultOpenTitles.includes(i.title)]))
    );

    const toggle = (title: string) => setOpen(prev => ({ ...prev, [title]: !prev[title] }));

    return (
        <SidebarMenu>
            {items.map((item, idx) => {
                const hasChildren = !!item.items?.length;
                const active = pathMatches(currentPath, item.href);
                const key = `${level}-${idx}-${item.title}`;

                if (hasChildren) {
                    const isOpen = open[item.title] ?? false;

                    return (
                        <SidebarMenuItem key={key}>
                            <SidebarMenuButton
                                type="button"
                                onClick={() => toggle(item.title)}
                                className={`group w-full justify-start ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                                aria-expanded={isOpen}
                            >
                                <ItemIcon icon={item.icon} />
                                <span className="truncate">{item.title}</span>
                                <ItemBadge badge={item.badge} />
                                <Caret open={isOpen} />
                            </SidebarMenuButton>

                            {/* children */}
                            {isOpen && (
                                <div className="ml-4 border-l border-slate-100 pl-3">
                                    <RecursiveMenu
                                        items={item.items!}
                                        currentPath={currentPath}
                                        defaultOpenTitles={defaultOpenTitles}
                                        level={level + 1}
                                    />
                                </div>
                            )}
                        </SidebarMenuItem>
                    );
                }

                // Leaf item
                const content = (
                    <>
                        <ItemIcon icon={item.icon} />
                        <span className="truncate">{item.title}</span>
                        <ItemBadge badge={item.badge} />
                    </>
                );

                return (
                    <SidebarMenuItem key={key}>
                        {item.href ? (
                            <SidebarMenuButton
                                asChild
                                className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {item.external ? (
                                    // external link
                                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                                        {content}
                                    </a>
                                ) : (
                                    // Inertia link
                                    <Link href={item.href} prefetch>
                                        {content}
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton disabled className="opacity-60">
                                {content}
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

/* --------------------------------- Export -------------------------------- */

export function AppSidebar() {
    const currentPath = useCurrentPath();
    const activeChain = React.useMemo(() => collectActiveChain(MAIN_ITEMS, currentPath), [currentPath]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <RecursiveMenu
                    items={MAIN_ITEMS}
                    currentPath={currentPath}
                    defaultOpenTitles={activeChain}
                />
            </SidebarContent>

            <SidebarFooter>
                {/* Footer quick links */}
                <SidebarMenu className="mt-auto">
                    {FOOTER_ITEMS.map((item, idx) => (
                        <SidebarMenuItem key={`footer-${idx}-${item.title}`}>
                            <SidebarMenuButton asChild>
                                <a href={item.href} target="_blank" rel="noopener noreferrer">
                                    <ItemIcon icon={item.icon} />
                                    <span className="truncate">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                {/* User/profile area */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
} 