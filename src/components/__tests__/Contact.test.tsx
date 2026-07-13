import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/Contact';

const contactProps: ContactProps = {
    header: "Let's Connect.",
    phone: '+1-555-555-5555',
    email: 'you@example.com',
    headquarters: 'City, State',
};

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText('Name'), 'Test User');
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Subject'), 'Hello');
    await user.type(screen.getByPlaceholderText('Message'), 'Test message');
    await user.click(screen.getByRole('button', { name: /submit/i }));
}

describe('Contact', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    it('shows validation errors when submitted empty', async () => {
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('POSTs to /api/contact and shows a success message', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Message sent successfully.' }),
        });
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await fillAndSubmit(user);

        expect(await screen.findByText('Message sent successfully.')).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
            method: 'POST',
        }));
    });

    it('shows an error message when the API call fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Failed to send message. Please try again later.' }),
        });
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await fillAndSubmit(user);

        expect(await screen.findByText(/failed to send message/i)).toBeInTheDocument();
    });
});
