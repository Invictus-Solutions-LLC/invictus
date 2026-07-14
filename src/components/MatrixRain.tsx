import React, { useEffect, useRef } from 'react';

const CHARACTERS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FONT_SIZE = 16;
const FRAME_INTERVAL_MS = 50;
// Muted red rather than the classic neon green, to match the site's red
// accent instead of competing with it as a full-background wash.
const RAIN_COLOR = '#B33A3A';

function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        let columns = 0;
        let drops: Array<number> = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / FONT_SIZE);
            drops = new Array(columns).fill(1);
        };
        resize();
        window.addEventListener('resize', resize);

        context.font = `${FONT_SIZE}px monospace`;

        // Respect reduced-motion by rendering one static frame instead of
        // continuously animating — but still render something, rather than
        // leaving the canvas silently blank.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            context.fillStyle = 'rgb(0, 0, 0)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = RAIN_COLOR;
            drops.forEach((_, i) => {
                const y = Math.floor(Math.random() * (canvas.height / FONT_SIZE));
                const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                context.fillText(char, i * FONT_SIZE, y * FONT_SIZE);
            });
            return () => window.removeEventListener('resize', resize);
        }

        const draw = () => {
            context.fillStyle = 'rgba(0, 0, 0, 0.05)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = RAIN_COLOR;

            drops.forEach((y, i) => {
                const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                context.fillText(char, i * FONT_SIZE, y * FONT_SIZE);

                if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 1;
            });
        };

        // Pause the repaint loop while the tab is hidden — a background tab
        // shouldn't spend battery animating pixels nobody can see.
        let interval: ReturnType<typeof setInterval> | null = setInterval(draw, FRAME_INTERVAL_MS);

        const handleVisibility = () => {
            if (document.hidden) {
                if (interval !== null) {
                    clearInterval(interval);
                    interval = null;
                }
            } else if (interval === null) {
                interval = setInterval(draw, FRAME_INTERVAL_MS);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden='true'
            className='fixed inset-0 z-0 pointer-events-none opacity-20'
        />
    );
}

export default MatrixRain;
