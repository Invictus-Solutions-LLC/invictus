import { useCallback, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';

const listeners = new Set<() => void>();

// Used when localStorage is unavailable (private windows, blocked cookies).
// A theme that doesn't survive a reload still beats one that doesn't work.
let fallback: Theme | null = null;

function isTheme(value: string | null): value is Theme {
    return value === 'dark' || value === 'light' || value === 'system';
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    // A choice made in one tab should follow the visitor into the others.
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

function readStored(): Theme {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isTheme(stored)) {
            return stored;
        }
    } catch {
        // Fall through to the in-memory value.
    }
    return fallback ?? 'system';
}

function prefersLight(): boolean {
    return window.matchMedia('(prefers-color-scheme: light)').matches;
}

function apply(theme: Theme): void {
    const light = theme === 'light' || (theme === 'system' && prefersLight());
    const classes = document.documentElement.classList;
    classes.toggle('light', light);
    classes.toggle('dark', !light);
}

// Mirrors the pre-paint script in src/lib/themeScript.js, which only reads
// storage. This hook owns the writes and the live system-preference
// subscription.
//
// useSyncExternalStore rather than state-in-an-effect: localStorage genuinely is
// an external store, and this is what lets the server render 'system' while the
// client renders the real stored choice without a hydration mismatch.
export function useTheme(): { theme: Theme; setTheme: (next: Theme) => void } {
    const theme = useSyncExternalStore(subscribe, readStored, () => 'system' as Theme);

    // Syncing the DOM to React state is exactly what effects are for.
    useEffect(() => {
        apply(theme);
    }, [theme]);

    // Only 'system' tracks the OS; an explicit choice must survive the visitor's
    // machine flipping to dark at sunset.
    useEffect(() => {
        if (theme !== 'system') {
            return;
        }
        const query = window.matchMedia('(prefers-color-scheme: light)');
        const onChange = () => apply('system');
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        fallback = next;
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Keeping the in-memory value is enough for this session.
        }
        listeners.forEach((listener) => listener());
    }, []);

    return { theme, setTheme };
}
