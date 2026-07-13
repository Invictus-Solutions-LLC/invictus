import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

type Props = {
    children: React.ReactNode;
    rowClassName?: string;
};

const EDGE_TOLERANCE_PX = 4;

function CardCarousel({ children, rowClassName = '' }: Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const row = rowRef.current;
        if (!row) {
            return;
        }
        setCanScrollLeft(row.scrollLeft > EDGE_TOLERANCE_PX);
        setCanScrollRight(row.scrollLeft < row.scrollWidth - row.clientWidth - EDGE_TOLERANCE_PX);
    }, []);

    useEffect(() => {
        const row = rowRef.current;
        if (!row) {
            return;
        }

        updateScrollState();
        row.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            row.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState, children]);

    const scrollByCard = (direction: 1 | -1) => {
        const row = rowRef.current;
        if (!row) {
            return;
        }
        const firstCard = row.firstElementChild as HTMLElement | null;
        const parsedGap = parseFloat(getComputedStyle(row).columnGap);
        const gap = Number.isNaN(parsedGap) ? 0 : parsedGap;
        const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : row.clientWidth;
        row.scrollBy({ left: direction * distance, behavior: 'smooth' });
    };

    return (
        <div
            className='relative w-full h-full'
        >
            <div
                ref={rowRef}
                className={`w-full h-full flex overflow-x-scroll snap-x snap-mandatory scrollbar-none scroll-smooth ${rowClassName}`}
            >
                {children}
            </div>

            <button
                type='button'
                aria-label='Previous'
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollLeft}
                className='absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-[#333333] bg-[#1e1e1e]/90 p-1.5 md:p-2 text-gray-400 transition-colors hover:border-[#FF0000]/60 hover:text-[#FF0000] disabled:opacity-0 disabled:pointer-events-none'
            >
                <ChevronLeftIcon
                    className='w-4 h-4 md:w-5 md:h-5'
                />
            </button>

            <button
                type='button'
                aria-label='Next'
                onClick={() => scrollByCard(1)}
                disabled={!canScrollRight}
                className='absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-[#333333] bg-[#1e1e1e]/90 p-1.5 md:p-2 text-gray-400 transition-colors hover:border-[#FF0000]/60 hover:text-[#FF0000] disabled:opacity-0 disabled:pointer-events-none'
            >
                <ChevronRightIcon
                    className='w-4 h-4 md:w-5 md:h-5'
                />
            </button>
        </div>
    );
}

export default CardCarousel;
