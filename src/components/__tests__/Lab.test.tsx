import { render, screen } from '@testing-library/react';
import Lab from '@/components/Lab';

const labProps: LabProps = {
    header: "What I'm digging into now",
    intro: 'Honest about where each one is.',
    entries: [
        { title: 'Live thing', text: 'Already running.', status: 'live', statusLabel: 'Live on this site', href: '#hero' },
        { title: 'In progress thing', text: 'Still building.', status: 'building', statusLabel: 'In progress' },
    ],
};

describe('Lab', () => {
    it('renders every entry with its status label', () => {
        render(<Lab {...labProps} />);

        expect(screen.getByRole('heading', { name: 'Live thing' })).toBeInTheDocument();
        expect(screen.getByText('Live on this site')).toBeInTheDocument();
        expect(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('only links an entry that has somewhere to go', () => {
        render(<Lab {...labProps} />);

        expect(screen.getAllByRole('link', { name: /take a look/i })).toHaveLength(1);
    });

    // A lone entry in a three-column grid reads as a gap rather than a card.
    it('does not stretch a single entry across a three-column grid', () => {
        const { container } = render(<Lab {...labProps} entries={labProps.entries.slice(0, 1)} />);

        const grid = container.querySelector('.grid');
        expect(grid?.className).not.toMatch(/grid-cols-3/);
    });

    // The section is meant to be empty sometimes — an empty heading with no
    // cards under it reads as neglect.
    it('renders nothing at all when there are no entries', () => {
        const { container } = render(<Lab {...labProps} entries={[]} />);

        expect(container).toBeEmptyDOMElement();
    });
});
