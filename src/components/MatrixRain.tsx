import React, { useEffect, useRef } from 'react';

const CHARACTERS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FONT_SIZE = 16;
const FRAME_INTERVAL_MS = 50;

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

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

        const draw = () => {
            context.fillStyle = 'rgba(0, 0, 0, 0.05)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#39FF88';
            context.font = `${FONT_SIZE}px monospace`;

            drops.forEach((y, i) => {
                const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                context.fillText(char, i * FONT_SIZE, y * FONT_SIZE);

                if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 1;
            });
        };

        const interval = setInterval(draw, FRAME_INTERVAL_MS);

        return () => {
            clearInterval(interval);
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
