import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');

        // A controller can render a component that was never written. Show a
        // clear placeholder rather than throwing an unhandled resolver error.
        if (!pages[`./pages/${name}.tsx`]) {
            const fallback: any = await resolvePageComponent('./pages/not-built.tsx', pages);
            const Component = fallback.default ?? fallback;
            const Wrapped = (props: Record<string, unknown>) => <Component {...props} component={name} />;
            return { ...fallback, default: Wrapped };
        }

        return resolvePageComponent(`./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
