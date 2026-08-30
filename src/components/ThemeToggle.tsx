import React from 'react';
import { useTheme } from '@/hooks/useTheme';

const OPTIONS: Array<{ value: Theme; label: string }> = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'Auto' },
];

// A three-state radio group rather than a two-state switch: "system" is a real
// choice, and collapsing it into a toggle takes it away from anyone whose OS
// already changes theme at sunset.
function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    return (
        <div
            role='radiogroup'
            aria-label='Colour theme'
            className={`flex gap-0.5 rounded-full border border-line p-0.5 ${className}`}
        >
            {
                OPTIONS.map(({ value, label }) => {
                    // Server-rendered as 'system'; the stored choice takes over
                    // on hydration, which is what useSyncExternalStore is for.
                    const selected = theme === value;

                    return (
                        <button
                            key={value}
                            type='button'
                            role='radio'
                            aria-checked={selected}
                            onClick={() => setTheme(value)}
                            className={
                                `rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 ` +
                                (selected ? 'bg-line text-fg' : 'text-muted hover:text-fg')
                            }
                        >
                            {label}
                        </button>
                    );
                })
            }
        </div>
    );
}

export default ThemeToggle;
