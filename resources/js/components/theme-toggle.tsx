import { type Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import * as React from 'react';

const MODES: { value: Appearance; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

interface ThemeToggleProps {
    /** Icons only, for a crowded header. */
    compact?: boolean;
    className?: string;
}

/**
 * Light, dark and system as three visible options rather than a button that
 * cycles: cycling hides which mode is on, and hides that "system" exists at
 * all — the one people want when their phone flips at sunset.
 */
export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            role="radiogroup"
            aria-label="Colour theme"
            className={cn('inline-flex items-center gap-0.5 rounded-full border border-border p-0.5', className)}
        >
            {MODES.map(({ value, label, icon: Icon }) => {
                const selected = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        title={label}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center justify-center rounded-full transition-colors',
                            compact ? 'size-7' : 'h-9 gap-2 px-3',
                            selected
                                ? 'bg-foreground text-background'
                                : 'copy-muted hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900',
                        )}
                    >
                        <Icon className={compact ? 'size-3.5' : 'size-4'} aria-hidden />
                        {!compact && (
                            <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
                        )}
                        <span className="sr-only">{compact ? label : ''}</span>
                    </button>
                );
            })}
        </div>
    );
}
