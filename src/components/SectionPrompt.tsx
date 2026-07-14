import React from 'react';

type Props = {
    // Plain section name for the accessibility tree ("About"), so screen
    // readers announce a normal heading instead of shell syntax.
    label: string;
    // The shell command rendered visually, e.g. 'cd ./about'.
    command: string;
    className?: string;
};

function SectionPrompt({ label, command, className = '' }: Props) {
    return (
        <h3
            aria-label={label}
            className={`static flex-shrink-0 z-20 text-gray-500 text-xl md:text-2xl tracking-[6px] md:tracking-[10px] lowercase ${className}`}
        >
            <span
                aria-hidden='true'
            >
                <span
                    className='text-[#FF0000]/70'
                >
                    {'$ '}
                </span>
                {command}
                <span
                    className='terminalCursor'
                />
            </span>
        </h3>
    );
}

export default SectionPrompt;
