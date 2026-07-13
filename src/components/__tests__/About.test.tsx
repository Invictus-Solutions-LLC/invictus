import { render, screen } from '@testing-library/react';
import About from '@/components/About';

const aboutProps: AboutProps = {
    header: 'Here is a little background',
    image: '/about.png',
    text: ['Paragraph one.', 'Paragraph two.'],
};

describe('About', () => {
    it('renders the header and all text paragraphs', () => {
        render(<About {...aboutProps} />);

        expect(screen.getByText(aboutProps.header)).toBeInTheDocument();
        aboutProps.text.forEach((paragraph) => {
            expect(screen.getByText(paragraph)).toBeInTheDocument();
        });
    });
});
