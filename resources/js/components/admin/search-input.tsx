import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Search, X } from 'lucide-react';
import * as React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Debounce in ms before onChange fires. */
    delay?: number;
    busy?: boolean;
    className?: string;
}

/**
 * Debounced search box. Types locally and only notifies the parent once
 * the user pauses, so filtering does not fire a request per keystroke.
 */
export function SearchInput({ value, onChange, placeholder = 'Search…', delay = 350, busy, className }: SearchInputProps) {
    const [local, setLocal] = React.useState(value);
    const latest = React.useRef(onChange);
    latest.current = onChange;

    // Keep in step when the parent resets filters.
    React.useEffect(() => setLocal(value), [value]);

    React.useEffect(() => {
        if (local === value) return;
        const id = setTimeout(() => latest.current(local), delay);
        return () => clearTimeout(id);
    }, [local, value, delay]);

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="pl-9"
            />
            {busy ? (
                <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
            ) : (
                local && (
                    <button
                        type="button"
                        onClick={() => setLocal('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                )
            )}
        </div>
    );
}
