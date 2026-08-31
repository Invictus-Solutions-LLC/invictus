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
const terminal = { sudo: 'nice try. you are not in the sudoers file.', ls: 'work  experience  skills' };
const messages: AskMessages = { asking: 'Reading…', throttled: 'Too many questions — wait a few minutes.', unavailable: 'Unavailable right now.', noMatch: 'Nothing matches that.' };

function setup(withExamples: Array<string> = examples) {
    const onClose = jest.fn();
    render(<CommandPalette onClose={onClose} commands={commands} examples={withExamples} messages={messages} terminal={terminal} />);
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

    // Typing a shell command into a security engineer's search box is a thing
    // people try. Answering costs nothing and rewards exactly that curiosity.
    it('answers a shell command instead of saying nothing matched', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'sudo');

        expect(await screen.findByText(/not in the sudoers file/, { selector: '.sr-only' })).toBeInTheDocument();
        expect(screen.queryByText('Nothing matches that.')).not.toBeInTheDocument();
    });

    // Answering a command AND offering to ask the model about it would spend a
    // real API call on a joke the palette has already told.
    it('does not offer to ask the model about a command it already answered', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'sudo');

        expect(await screen.findByText(/not in the sudoers file/, { selector: '.sr-only' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /ask/i })).not.toBeInTheDocument();
    });

    it('matches a command regardless of case or surrounding space', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), '  SUDO  ');

        expect(await screen.findByText(/not in the sudoers file/, { selector: '.sr-only' })).toBeInTheDocument();
    });

    // The animation is decoration; the sentence is the content. A screen reader
    // must get the finished string once, not one announcement per character.
    it('exposes the whole reply to assistive technology at once', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'sudo');

        const spoken = await screen.findByText('nice try. you are not in the sudoers file.', { selector: '.sr-only' });
        expect(spoken).toHaveClass('sr-only');
    });

    // A real question that merely contains a command word is still a question.
    it('does not hijack a question that happens to mention a command', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'do you know sudo?');

        expect(screen.queryByText(/not in the sudoers file/, { selector: '.sr-only' })).not.toBeInTheDocument();
        expect(screen.getByRole('option', { name: /ask/i })).toBeInTheDocument();
    });

    it('offers to ask when the query reads like a question', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');

        expect(screen.getByRole('option', { name: /ask:/i })).toBeInTheDocument();
    });

    // The endpoint still asks the model to cite which notes it used, because
    // having to name a source keeps it inside the corpus. That citation is a
    // grounding device for the server, not provenance for the visitor — showing
    // a reader "skills.json" tells them nothing they can act on.
    it('answers from the endpoint without showing which files it used', async () => {
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

        expect(await screen.findByText(/used Kubernetes/, { selector: '.sr-only' })).toBeInTheDocument();
        expect(screen.queryByText('skills.json')).not.toBeInTheDocument();
        expect(screen.queryByText(/based on/i)).not.toBeInTheDocument();
    });

    // The answer types itself out like the shell replies do, but a live region
    // must still hand a screen reader the finished sentence exactly once.
    it('exposes the whole answer to assistive technology at once', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'He has, on several projects.', sources: [], sectionId: null }),
        } as Response);

        const user = userEvent.setup();
        setup();

        await user.type(screen.getByRole('combobox'), 'do you know kubernetes?');
        await user.keyboard('{Enter}');

        const spoken = await screen.findByText('He has, on several projects.', { selector: '.sr-only' });
        expect(spoken).toHaveClass('sr-only');
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
