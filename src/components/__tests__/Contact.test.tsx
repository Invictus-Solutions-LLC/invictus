import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact, { buildMailtoUrl } from '@/components/Contact';

const contactProps: ContactProps = {
    header: "Let's Connect.",
    phone: '+1-555-555-5555',
    email: 'you@example.com',
    headquarters: 'City, State',
};

describe('Contact', () => {
    it('shows validation errors when submitted empty', async () => {
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    });

    it('accepts a valid submission without validation errors', async () => {
        const user = userEvent.setup();
        render(<Contact {...contactProps} />);

        await user.type(screen.getByPlaceholderText('Name'), 'Test User');
        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
        await user.type(screen.getByPlaceholderText('Subject'), 'Hello');
        await user.type(screen.getByPlaceholderText('Message'), 'Test message');
        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
    });
});

describe('buildMailtoUrl', () => {
    // Regression test: the mailto link used to hardcode a literal email address
    // instead of using the `email` prop passed into the component.
    it('builds the mailto link from the given email, not a hardcoded address', () => {
        const url = buildMailtoUrl(contactProps.email, {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Hello',
            message: 'Test message',
        });

        expect(url).toContain(`mailto:${contactProps.email}`);
        expect(url.indexOf(`mailto:${contactProps.email}`)).toBe(0);
    });
});
