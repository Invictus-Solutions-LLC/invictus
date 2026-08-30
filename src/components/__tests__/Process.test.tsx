import { render, screen } from '@testing-library/react';
import Process from '@/components/Process';

const processProps: ProcessProps = {
    header: 'How working together goes',
    intro: 'No mystery, no black box.',
    steps: [
        { title: 'You tell me the problem', text: 'In your words.' },
        { title: 'I scope it honestly', text: 'Fixed price and timeline.' },
    ],
};

describe('Process', () => {
    it('renders the steps as an ordered list, numbered from content order', () => {
        render(<Process {...processProps} />);

        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getByText('01')).toBeInTheDocument();
        expect(screen.getByText('02')).toBeInTheDocument();
        processProps.steps.forEach((step) => {
            expect(screen.getByRole('heading', { name: step.title })).toBeInTheDocument();
        });
    });
});
