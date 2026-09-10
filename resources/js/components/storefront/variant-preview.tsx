import React, { useEffect, useRef, useState } from 'react';

interface Props {
    images: string[];
    alt: string;
    /** Milliseconds each shot holds before the crossfade. */
    period?: number;
    /** Staggers a grid so the cards do not all flip on the same beat. */
    delay?: number;
    className?: string;
    /** Badges and gradients drawn over the shots, inside the same frame. */
    children?: React.ReactNode;
    showDots?: boolean;
}

/** Someone who has asked their OS to stop animations gets the first shot only. */
function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!query) return;

        setReduced(query.matches);
        const onChange = () => setReduced(query.matches);
        query.addEventListener('change', onChange);

        return () => query.removeEventListener('change', onChange);
    }, []);

    return reduced;
}

/**
 * A product card that cycles its variants — the same blank in five prints is
 * unsellable from one photograph.
 *
 * All the shots are layered and crossfaded rather than swapped, so there is no
 * flash of an unloaded image mid-cycle. The timer only runs while the card is
 * on screen and the pointer is elsewhere: a shopper looking at one card should
 * not have it change under them, and a grid below the fold should not animate.
 */
export default function VariantPreview({
    images,
    alt,
    period = 2600,
    delay = 0,
    className = '',
    children,
    showDots = true,
}: Props) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [onScreen, setOnScreen] = useState(false);
    const frame = useRef<HTMLDivElement>(null);
    const reduced = usePrefersReducedMotion();

    const shots = images.filter(Boolean);
    const cycling = shots.length > 1 && !reduced;

    useEffect(() => {
        const node = frame.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setOnScreen(true);

            return;
        }

        const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
            rootMargin: '80px',
        });
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!cycling || paused || !onScreen) return;

        let ticker: number;
        const stagger = window.setTimeout(() => {
            ticker = window.setInterval(() => setIndex((n) => (n + 1) % shots.length), period);
        }, delay);

        return () => {
            window.clearTimeout(stagger);
            window.clearInterval(ticker);
        };
    }, [cycling, paused, onScreen, shots.length, period, delay]);

    return (
        <div
            ref={frame}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`relative overflow-hidden ${className}`}
        >
            {(shots.length ? shots : ['/images/placeholder.png']).map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt={i === 0 ? alt : ''}
                    aria-hidden={i !== 0}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
                        i === index ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            {children}

            {showDots && cycling && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                    {shots.map((src, i) => (
                        <span
                            key={src}
                            className={`h-1 rounded-full bg-white shadow transition-all duration-500 ${
                                i === index ? 'w-5 opacity-95' : 'w-1 opacity-50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
