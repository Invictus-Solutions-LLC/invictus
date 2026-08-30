import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPalette from '@/components/CommandPalette';
import type { PaletteCommand } from '@/components/CommandPalette';

const push = jest.fn();
jest.mock('next/router', () => ({
    useRouter: () => ({ push: (href: string) => push(href) }),
}));

const commands: Array<PaletteCommand> = [
    { id: 'go-work', label: "Things I've built", hint: 'work', group: 'Go to', href: '#work', external: false },
    { id: 'go-skills', label: 'What I work with', hint: 'skills', group: 'Go to', href: '#skills', external: false },
    { id: 'project-floops', label: 'FloOps', hint: 'floops.io', group: 'Projects', href: 'https://floops.io', external: true },
];

const examples = ['do you know Python?', 'tell me about FloOps'];
const messages: AskMessages = { asking: 'Reading…', throttled: 'Too many questions — wait a few minutes.', unavailable: 'Unavailable right now.', noMatch: 'Nothing matches that.' };

function setup(withExamples: Array<string> = examples) {
    const onClose = jest.fn();
    render(<CommandPalette onClose={onClose} commands={commands} examples={withExamples} messages={messages} />);
    return { onClose };
}

describe('CommandPalette', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        push.mockClear();
    });

    it('opens as a modal dialog with a labelled combobox', () => {
        setup();

        expect(screen.getByRole('dialog', { name: /search and ask/i })).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // The box takes plain questions, and nothing else on the page says so — the
    // placeholder is where that gets taught.
    it('suggests a real question in the placeholder', () => {
        setup();

        expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', examples[0]);
    });

    // An empty content list must not leave the input with a blank placeholder.
    it('falls back to a written placeholder when content has no examples', () => {
        setup([]);

        expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', expect.stringMatching(/ask a question/i));
    });

    // The placeholder is decoration; the accessible name has to carry the full
    // description regardless of what it happens to be showing.
    it('keeps a stable accessible name whatever the placeholder says', () => {
        setup();

        expect(screen.getByRole('combobox')).toHaveAccessibleName(/ask a question or jump to a section/i);
    });

    it('filters the list as you type', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'flo');

        expect(screen.getByText('FloOps')).toBeInTheDocument();
        expect(screen.queryByText("Things I've built")).not.toBeInTheDocument();
    });

    it('navigates in-page commands with the keyboard', async () => {
        const user = userEvent.setup();
        const { onClose } = setup();

        await user.type(screen.getByRole('combobox'), 'skills');
        await user.keyboard('{Enter}');

        expect(push).toHaveBeenCalledWith('#skills');
        expect(onClose).toHaveBeenCalled();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        const { onClose } = setup();

        await user.keyboard('{Escape}');

        expect(onClose).toHaveBeenCalled();
    });

    it('offers to ask when the query reads like a question', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');

        expect(screen.getByRole('option', { name: /ask:/i })).toBeInTheDocument();
    });

    it('answers from the endpoint and shows which files it used', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                answer: 'Blaise has used Kubernetes in his infrastructure work.',
                sources: ['skills.json'],
                sectionId: 'skills',
            }),
        } as Response);

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');
        await user.keyboard('{Enter}');

        expect(await screen.findByText(/used Kubernetes/)).toBeInTheDocument();
        expect(screen.getByText('skills.json')).toBeInTheDocument();
    });

    // The model is asked which section answers the question; that answer has to
    // lead somewhere rather than being requested and discarded.
    it('offers to navigate to the section the answer points at', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'He does.', sources: [], sectionId: 'skills' }),
        } as Response);

        const user = userEvent.setup();
        const { onClose } = setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');
        await user.keyboard('{Enter}');

        const go = await screen.findByRole('button', { name: /take me there/i });
        await user.click(go);

        expect(push).toHaveBeenCalledWith('#skills');
        expect(onClose).toHaveBeenCalled();
    });

    // The button is not one of the listbox options, so the arrows never reach
    // it. If Tab does not either, it is unreachable without a mouse — a WCAG
    // 2.1.1 failure that the click-driven test above cannot see.
    it('lets a keyboard reach and activate the destination button', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'He does.', sources: [], sectionId: 'skills' }),
        } as Response);

        const user = userEvent.setup();
        const { onClose } = setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');
        await user.keyboard('{Enter}');

        const go = await screen.findByRole('button', { name: /take me there/i });

        await user.tab();
        expect(go).toHaveFocus();

        // Enter has to activate the focused button rather than being swallowed
        // by the combobox handler that drives the list.
        await user.keyboard('{Enter}');

        expect(push).toHaveBeenCalledWith('#skills');
        expect(onClose).toHaveBeenCalled();
    });

    // The trap still has to hold: Tab must never land on the page behind an
    // aria-modal dialog.
    it('keeps Tab inside the dialog in both directions', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'He does.', sources: [], sectionId: 'skills' }),
        } as Response);

        const user = userEvent.setup();
        setup();

        const input = screen.getByRole('combobox');
        await user.type(input, 'do you know kubernetes?');
        await user.keyboard('{Enter}');

        const go = await screen.findByRole('button', { name: /take me there/i });
        const dialog = screen.getByRole('dialog');

        await user.tab();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
        expect(go).toHaveFocus();

        await user.tab();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
        expect(input).toHaveFocus();

        await user.tab({ shift: true });
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
        expect(go).toHaveFocus();
    });

    it('offers no destination when the answer names none', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'I do not know.', sources: [], sectionId: null }),
        } as Response);

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'what is his salary?');
        await user.keyboard('{Enter}');

        await screen.findByText(/i do not know/i);
        expect(screen.queryByRole('button', { name: /take me there/i })).not.toBeInTheDocument();
    });

    // The whole point of the fallback: an unconfigured or rate-limited endpoint
    // must leave a working navigation palette rather than an error screen.
    it('degrades to plain navigation when answering is unavailable', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'can you build me a booking system?');
        await user.keyboard('{Enter}');

        expect(await screen.findByText(messages.unavailable)).toBeInTheDocument();
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Rate limiting is the one failure the visitor can do something about, and
    // saying so leaks nothing about how the server is configured.
    it('tells a rate-limited visitor to wait rather than saying it is broken', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 429 } as Response);

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'can you build me a booking system?');
        await user.keyboard('{Enter}');

        expect(await screen.findByText(messages.throttled)).toBeInTheDocument();
        expect(screen.queryByText(messages.unavailable)).not.toBeInTheDocument();
    });

    it('degrades the same way when the request throws', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'can you build me a booking system?');
        await user.keyboard('{Enter}');

        expect(await screen.findByText(messages.unavailable)).toBeInTheDocument();
        expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
    });
});
