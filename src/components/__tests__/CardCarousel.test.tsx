import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardCarousel from '@/components/CardCarousel';

function mockRowGeometry(row: HTMLElement, { scrollLeft, scrollWidth, clientWidth }: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
    Object.defineProperty(row, 'scrollWidth', { value: scrollWidth, configurable: true });
    Object.defineProperty(row, 'clientWidth', { value: clientWidth, configurable: true });
    Object.defineProperty(row, 'scrollLeft', { value: scrollLeft, configurable: true, writable: true });
    fireEvent.scroll(row);
}

describe('CardCarousel', () => {
    it('renders its children inside the scrollable row', () => {
        render(
            <CardCarousel>
                <div>Card one</div>
                <div>Card two</div>
            </CardCarousel>
        );

        expect(screen.getByText('Card one')).toBeInTheDocument();
        expect(screen.getByText('Card two')).toBeInTheDocument();
    });

    it('disables the previous button and enables next when at the start', () => {
        const { container } = render(
            <CardCarousel>
                <div>Card one</div>
            </CardCarousel>
        );
        const row = container.querySelector('.overflow-x-scroll') as HTMLElement;
        mockRowGeometry(row, { scrollLeft: 0, scrollWidth: 2000, clientWidth: 500 });

        expect(screen.getByLabelText('Previous')).toBeDisabled();
        expect(screen.getByLabelText('Next')).not.toBeDisabled();
    });

    it('disables the next button when scrolled to the end', () => {
        const { container } = render(
            <CardCarousel>
                <div>Card one</div>
            </CardCarousel>
        );
        const row = container.querySelector('.overflow-x-scroll') as HTMLElement;
        mockRowGeometry(row, { scrollLeft: 1500, scrollWidth: 2000, clientWidth: 500 });

        expect(screen.getByLabelText('Previous')).not.toBeDisabled();
        expect(screen.getByLabelText('Next')).toBeDisabled();
    });

    it('scrolls the row forward by one card width when next is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <CardCarousel>
                <div>Card one</div>
                <div>Card two</div>
            </CardCarousel>
        );
        const row = container.querySelector('.overflow-x-scroll') as HTMLElement;
        mockRowGeometry(row, { scrollLeft: 0, scrollWidth: 2000, clientWidth: 500 });
        const firstCard = screen.getByText('Card one');
        jest.spyOn(firstCard, 'getBoundingClientRect').mockReturnValue({ width: 480 } as DOMRect);
        const scrollBySpy = jest.fn();
        row.scrollBy = scrollBySpy;

        await user.click(screen.getByLabelText('Next'));

        expect(scrollBySpy).toHaveBeenCalledWith({ left: 480, behavior: 'smooth' });
    });

    it('scrolls the row backward by one card width when previous is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <CardCarousel>
                <div>Card one</div>
            </CardCarousel>
        );
        const row = container.querySelector('.overflow-x-scroll') as HTMLElement;
        mockRowGeometry(row, { scrollLeft: 500, scrollWidth: 2000, clientWidth: 500 });
        const firstCard = screen.getByText('Card one');
        jest.spyOn(firstCard, 'getBoundingClientRect').mockReturnValue({ width: 480 } as DOMRect);
        const scrollBySpy = jest.fn();
        row.scrollBy = scrollBySpy;

        await user.click(screen.getByLabelText('Previous'));

        expect(scrollBySpy).toHaveBeenCalledWith({ left: -480, behavior: 'smooth' });
    });
});
