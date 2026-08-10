import React from 'react';

type Props = {
    // Plain section name for the accessibility tree ("About"), so screen
    // readers announce a normal heading instead of shell syntax.
    label: string;
    // The shell command rendered visually, e.g. 'cd ./about'.
    command: string;
    className?: string;
    // 'stacked' (default): full-width heading sitting above its section content,
    // where the wide tracking has room to breathe.
    // 'sidebar': heading in a narrow column beside the content on large screens;
    // the tracking stays tight so the command fits on one line (see TRACKING).
    variant?: 'stacked' | 'sidebar';
};

// Sidebar tracking is tight (1px) so the longest command, '$ cd ./experience',
// fits on one line in the 18rem (288px) column: it measures 275px at md+ type
// size. Deliberately no `whitespace-nowrap` — if a font fallback ever renders
// wider, it wraps to two lines rather than overflowing the column.
const TRACKING = {
    stacked: 'tracking-[6px] md:tracking-[10px]',
    sidebar: 'tracking-[1px] leading-tight',
} as const;

function SectionPrompt({ label, command, className = '', variant = 'stacked' }: Props) {
    return (
        <h2
            aria-label={label}
            className={`static flex-shrink-0 z-20 text-gray-400 text-xl md:text-2xl ${TRACKING[variant]} lowercase ${className}`}
        >
            <span
                aria-hidden='true'
            >
                <span
                    className='text-terminal-red'
                >
                    {'$ '}
                </span>
                {command}
                <span
                    className='terminalCursor'
                />
            </span>
        </h2>
    );
}

export default SectionPrompt;
