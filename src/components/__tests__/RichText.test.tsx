import { render, screen } from '@testing-library/react';
import RichText from '@/components/RichText';

describe('RichText', () => {
    it('renders plain text unchanged when there are no links', () => {
        render(<RichText text='just some plain prose.' />);
        expect(screen.getByText('just some plain prose.')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('turns a [label](https url) span into a safe external link, keeping surrounding text', () => {
        render(<RichText text='I hold the [PNPT](https://example.com/cred) cert.' />);

        const link = screen.getByRole('link', { name: 'PNPT' });
        expect(link).toHaveAttribute('href', 'https://example.com/cred');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        // surrounding text survives
        expect(screen.getByText(/I hold the/)).toBeInTheDocument();
        expect(screen.getByText(/cert\./)).toBeInTheDocument();
    });

    it('ignores non-https link syntax (no javascript: injection)', () => {
        render(<RichText text='click [here](javascript:alert(1)) now' />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        // the raw, un-parsed text is left as-is rather than becoming a link
        expect(screen.getByText(/click \[here\]\(javascript:alert\(1\)\) now/)).toBeInTheDocument();
    });
});
