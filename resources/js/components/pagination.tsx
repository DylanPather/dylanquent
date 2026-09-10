import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

/** One entry of Laravel's `linkCollection()`. */
export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginatorLink[];
    currentPage: number;
    lastPage: number;
    /** Announced to screen readers, e.g. "Products". */
    label?: string;
    className?: string;
}

/**
 * Paginator for anything served by a Laravel paginator.
 *
 * Laravel's link list is always [previous, ...pages, next], with "..." in the
 * page run wherever it elides. The previous and next entries carry long labels
 * ("&laquo; Previous"), so they cannot share a control size with a page number
 * — squeezing them into the same box is what left the old one with its labels
 * wrapping over the page circle.
 *
 * The page run is hidden below `sm`, where a dozen circles do not fit, and
 * replaced with the position in words.
 */
export function Pagination({ links, currentPage, lastPage, label = 'results', className }: PaginationProps) {
    // A single page has nothing to navigate.
    if (lastPage <= 1) return null;

    const previous = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <nav aria-label={`${label} pagination`} className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
            <Step link={previous} direction="previous" />

            <ol className="hidden items-center gap-1.5 sm:flex sm:gap-2">
                {pages.map((page, i) => (
                    <li key={`${page.label}-${i}`}>
                        <PageNumber link={page} />
                    </li>
                ))}
            </ol>

            <p className="px-2 text-[12px] font-bold tracking-[0.14em] uppercase copy-muted sm:hidden">
                {currentPage} / {lastPage}
            </p>

            <Step link={next} direction="next" />
        </nav>
    );
}

function Step({ link, direction }: { link: PaginatorLink | undefined; direction: 'previous' | 'next' }) {
    const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
    const text = direction === 'previous' ? 'Previous' : 'Next';

    const shape =
        'flex h-11 items-center gap-2 rounded-full border px-4 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors sm:px-5';

    // No url means there is no page that way. Rendered as text rather than a
    // dead link, so it is skipped by the keyboard and by screen readers.
    if (!link?.url) {
        return (
            <span aria-hidden className={cn(shape, 'cursor-not-allowed border-border opacity-30')}>
                {direction === 'previous' && <Icon className="size-4" />}
                <span className="hidden sm:inline">{text}</span>
                {direction === 'next' && <Icon className="size-4" />}
            </span>
        );
    }

    return (
        <Link
            href={link.url}
            rel={direction === 'previous' ? 'prev' : 'next'}
            aria-label={`${text} page`}
            className={cn(shape, 'border-border hover:border-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900')}
        >
            {direction === 'previous' && <Icon className="size-4" />}
            <span className="hidden sm:inline">{text}</span>
            {direction === 'next' && <Icon className="size-4" />}
        </Link>
    );
}

function PageNumber({ link }: { link: PaginatorLink }) {
    const shape = 'flex size-11 items-center justify-center rounded-full text-[12px] font-bold tracking-[0.06em] transition-colors';

    // Laravel emits "..." for an elided run; it is a gap, not a destination.
    if (!link.url) {
        return (
            <span aria-hidden className={cn(shape, 'copy-ghost')}>
                …
            </span>
        );
    }

    return (
        <Link
            href={link.url}
            aria-label={`Page ${link.label}`}
            aria-current={link.active ? 'page' : undefined}
            className={cn(
                shape,
                link.active
                    ? 'bg-foreground text-background shadow-lg'
                    : 'border border-border copy-muted hover:border-foreground hover:text-foreground',
            )}
        >
            {link.label}
        </Link>
    );
}
