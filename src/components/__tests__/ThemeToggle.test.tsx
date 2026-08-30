import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.className = '';
    });

    it('exposes the three choices as a radio group', () => {
        render(<ThemeToggle />);

        expect(screen.getByRole('radiogroup', { name: /colour theme/i })).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    // "System" is a real choice — collapsing it into a two-state switch takes it
    // away from anyone whose OS already changes theme at sunset.
    it('defaults to following the system when nothing is stored', async () => {
        render(<ThemeToggle />);

        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'Auto' })).toHaveAttribute('aria-checked', 'true');
        });
    });

    it('persists an explicit choice and applies it to the document', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        await user.click(screen.getByRole('radio', { name: 'Light' }));

        expect(window.localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('restores a previously stored choice', async () => {
        window.localStorage.setItem('theme', 'dark');
        render(<ThemeToggle />);

        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
        });
    });

    // Private windows and blocked-cookie setups throw on access; a theme that
    // doesn't persist is still better than a page that fails to render.
    it('keeps working when localStorage is unavailable', async () => {
        const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('denied');
        });
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('denied');
        });

        const user = userEvent.setup();
        render(<ThemeToggle />);
        await user.click(screen.getByRole('radio', { name: 'Light' }));

        expect(document.documentElement.classList.contains('light')).toBe(true);

        getItem.mockRestore();
        setItem.mockRestore();
    });
});
