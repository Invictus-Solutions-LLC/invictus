import React from 'react';

type Props = {
    path: string;
    children: React.ReactNode;
    className?: string;
};

function TerminalWindow({ path, children, className = '' }: Props) {
    return (
        <div
            className={`terminalWindow ${className}`}
        >
            <div
                className='terminalTitlebar'
            >
                <span
                    className='terminalDot bg-[#FF5F56]'
                />
                <span
                    className='terminalDot bg-[#FFBD2E]'
                />
                <span
                    className='terminalDot bg-[#27C93F]'
                />
                <span
                    className='ml-2 truncate'
                >
                    {path}
                </span>
            </div>

            <div
                className='flex-1 min-h-0 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                {children}
            </div>
        </div>
    );
}

export default TerminalWindow;
