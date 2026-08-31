import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/Contact';

const contactProps: ContactProps = {
    header: "Let's connect.",
    phone: '+1-408-555-0100',
    email: 'contact@example.com',
    headquarters: "Honolulu, Hawai'i",
    status: { sending: 'establishing uplink… transmitting', success: 'transmission complete', error: 'transmission failed' },
    cta: {
        header: 'Got something that needs building?',
        invitation: 'Tell me the problem in your own words.',
        buttonLabel: 'Start a conversation',
    },
    linkLabel: 'Get in touch',
};

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Work');
    await user.type(screen.getByLabelText('Message'), 'Hello there.');
}

describe('Contact', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the closing invitation and the contact details from content', () => {
        render(<Contact {...contactProps} />);

        expect(screen.getByRole('heading', { level: 2, name: contactProps.cta.header })).toBeInTheDocument();
        expect(screen.getByText(contactProps.cta.invitation)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: contactProps.email })).toHaveAttribute('href', 'mailto:contact@example.com');
        expect(screen.getByText(contactProps.headquarters)).toBeInTheDocument();
    });

    it('labels every field so it is reachable without a placeholder', () => {
        render(<Contact {...contactProps} />);

        ['Name', 'Email', 'Subject', 'Message'].forEach((label) => {
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });
    });

    it('blocks submission and announces errors when fields are empty', async () => {
        const fetchSpy = jest.spyOn(global, 'fetch');
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await user.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText('Name is required.')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('posts the submission and reports success', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Message sent successfully.' }),
        } as Response);

        const user = userEvent.setup();
        render(<Contact {...contactProps} />);
        await fillIn(user);
        await user.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText('Message sent successfully.')).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
    });

    // The terminal prefixes are visual character. What a screen reader gets has
    // to stay a plain sentence — "establishing uplink" describes nothing, and
    // "check mark colon colon" ahead of every result is noise.
    it('shows the terminal status line but announces plain language', async () => {
        let settle: (value: Response) => void = () => {};
        jest.spyOn(global, 'fetch').mockReturnValue(
            new Promise<Response>((resolve) => { settle = resolve; }),
        );

        const user = userEvent.setup();
        render(<Contact {...contactProps} />);
        await fillIn(user);
        await user.click(screen.getByRole('button', { name: /send message/i }));

        const line = await screen.findByText(/establishing uplink/, { selector: '[aria-hidden="true"]' });
        expect(line).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('Sending your message…')).toHaveClass('sr-only');

        settle({ ok: true, json: async () => ({ message: 'Message sent successfully.' }) } as Response);

        const done = await screen.findByText(/transmission complete/, { selector: '[aria-hidden="true"]' });
        expect(done).toHaveAttribute('aria-hidden', 'true');
        // The sentence a visitor can act on is never inside the hidden prefix.
        expect(screen.getByText('Message sent successfully.')).toBeInTheDocument();
    });

    it('marks a failed send with the same terminal treatment', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Failed to send message. Please try again later.' }),
        } as Response);

        const user = userEvent.setup();
        render(<Contact {...contactProps} />);
        await fillIn(user);
        await user.click(screen.getByRole('button', { name: /send message/i }));

        const failed = await screen.findByText(/transmission failed/, { selector: '[aria-hidden="true"]' });
        expect(failed).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('Failed to send message. Please try again later.')).toBeInTheDocument();

        // Failure has to read as a warning, not as success.
        expect(screen.getByRole('status')).toHaveClass('text-warm');
    });

    it("surfaces the server's message when the submission is rejected", async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Too many requests. Please try again later.' }),
        } as Response);

        const user = userEvent.setup();
        render(<Contact {...contactProps} />);
        await fillIn(user);
        await user.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText('Too many requests. Please try again later.')).toBeInTheDocument();
    });

    // A network failure must not leave the form looking like it succeeded.
    it('reports a transport failure without leaking the underlying error', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

        const user = userEvent.setup();
        render(<Contact {...contactProps} />);
        await fillIn(user);
        await user.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to send message. Please try again later.')).toBeInTheDocument();
        });
        expect(screen.queryByText(/ENOTFOUND/)).not.toBeInTheDocument();
    });
});
