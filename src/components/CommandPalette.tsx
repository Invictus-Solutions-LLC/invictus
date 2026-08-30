import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import { useTypedPlaceholder } from '@/hooks/useTypedPlaceholder';
import { useTypewriter } from '@/hooks/useTypewriter';

export type PaletteCommand = {
    id: string;
    label: string;
    hint: string;
    group: string;
    href: string;
    external: boolean;
};

// Used when the content file has no examples to cycle. The input must never be
// left with a blank placeholder just because that list is empty.
const FALLBACK_PLACEHOLDER = 'Ask a question, or jump to a section…';

type Answer = {
    answer: string;
    sectionId: string | null;
};

type AskState = 'idle' | 'asking' | 'answered' | 'unavailable' | 'throttled';

type Props = {
    onClose: () => void;
    commands: Array<PaletteCommand>;
    // Real questions, built from content, cycled through the placeholder so a
    // visitor learns the box takes more than keywords.
    examples: Array<string>;
    // What the palette says back. Structural labels stay in the markup; these
    // are sentences addressed to the visitor, so they are the owner's to word.
    messages: AskMessages;
    // Canned replies to shell commands, for the visitors who try typing one
    // into a security engineer's search box.
    terminal: Record<string, string>;
};

// A question is anything that isn't obviously a nav keyword. Two or more words,
// or a question mark, is a good enough signal — and getting it wrong is cheap,
// because asking is always offered rather than forced.
// Tab has to stay inside an aria-modal dialog, which means knowing what is
// focusable in it right now. Read at keypress time rather than cached: the
// answer panel and its button appear only once a question has been answered.
function getFocusable(root: HTMLElement | null): Array<HTMLElement> {
    if (!root) {
        return [];
    }

    const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    // A hidden control must never become a dead stop in the cycle. Checked via
    // computed style rather than offsetParent, which is also null for a
    // perfectly visible position:fixed element — and which no layout-free test
    // environment can answer at all.
    return [...root.querySelectorAll<HTMLElement>(selector)].filter((element) => {
        if (element.hidden) {
            return false;
        }

        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    });
}

function looksLikeQuestion(query: string): boolean {
    return query.includes('?') || query.trim().split(/\s+/).length >= 3;
}

function matches(command: PaletteCommand, query: string): boolean {
    const haystack = `${command.label} ${command.hint} ${command.group}`.toLowerCase();
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => haystack.includes(term));
}

// Mounted only while open (see index.tsx), so every opening starts clean
// without an effect reaching in to reset four pieces of state.
function CommandPalette({ onClose, commands, examples, messages, terminal }: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [activeState, setActiveState] = useState({ query: '', index: 0 });
    const [askState, setAskState] = useState<AskState>('idle');
    const [answer, setAnswer] = useState<Answer | null>(null);

    // A typed shell command, matched case-insensitively on the whole query so
    // "sudo" answers but "do you know sudo?" is still a real question.
    const command = query.trim().toLowerCase();
    const terminalReply = Object.prototype.hasOwnProperty.call(terminal, command)
        ? terminal[command]
        : null;
    const { typed, done: typedOut } = useTypewriter(terminalReply ?? '');
    // Answers type out for the same reason the shell replies do. Called
    // unconditionally, as hooks must be — an empty string simply never runs.
    const { typed: typedAnswer, done: answerDone } = useTypewriter(
        askState === 'answered' ? answer?.answer ?? '' : '',
    );

    // Server-rendered as the Windows/Linux hint, corrected on hydration.
    const shortcut = useSyncExternalStore(
        () => () => undefined,
        () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'),
        () => 'Ctrl K',
    );

    // Derived rather than reset in an effect: a new query means the selection
    // belongs to the old one, so it falls back to the first result.
    const active = activeState.query === query ? activeState.index : 0;

    const setActive = useCallback((next: number | ((current: number) => number)) => {
        setActiveState((state) => {
            const current = state.query === query ? state.index : 0;
            const index = typeof next === 'function' ? next(current) : next;
            // Returning the same object lets React bail out — without this,
            // hovering an option re-renders and can re-fire mouseenter on the
            // replaced node.
            if (state.query === query && state.index === index) {
                return state;
            }
            return { query, index };
        });
    }, [query]);

    // Only while the box is empty — once someone types, their own text is the
    // placeholder's job done.
    const placeholder = useTypedPlaceholder(examples, query.length === 0);

    const results = useMemo(() => {
        return query.trim() ? commands.filter((command) => matches(command, query)) : commands;
    }, [commands, query]);

    // Offered whenever the query reads like a question, and also when nothing
    // matched — that second case is the one that saves a dead end.
    // A recognised shell command is already answered, so it must not also offer
    // to spend a real model call on itself.
    const canAsk = !terminalReply
        && query.trim().length > 2
        && (looksLikeQuestion(query) || results.length === 0);
    const options = canAsk ? ['ask', ...results.map((result) => result.id)] : results.map((result) => result.id);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // The page behind must not scroll while the dialog is up.
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    const runCommand = useCallback((command: PaletteCommand) => {
        onClose();
        if (command.external) {
            window.open(command.href, '_blank', 'noopener,noreferrer');
            return;
        }
        void router.push(command.href);
    }, [onClose, router]);

    const ask = useCallback(async () => {
        setAskState('asking');
        setAnswer(null);
        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query }),
            });

            if (!response.ok) {
                // Every failure degrades to the plain navigation palette rather
                // than an error screen — the list below stays perfectly usable.
                //
                // Rate limiting is called out separately because it is the one
                // failure the visitor can do something about, and saying so
                // leaks nothing about how the server is configured.
                setAskState(response.status === 429 ? 'throttled' : 'unavailable');
                return;
            }

            const data: Answer = await response.json();
            setAnswer(data);
            setAskState('answered');
        }
        catch {
            setAskState('unavailable');
        }
    }, [query]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
            return;
        }

        // Keep Tab inside the dialog, but cycle through what is actually in
        // here rather than pinning focus to the input. The answer panel renders
        // a "Take me there" button, and pinning made it unreachable by keyboard
        // altogether: it is not one of the listbox options, so the arrow keys
        // never reached it either.
        if (event.key === 'Tab') {
            const focusable = getFocusable(dialogRef.current);
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const [first] = focusable;
            const last = focusable[focusable.length - 1];
            if (!first || !last) {
                event.preventDefault();
                return;
            }

            const current = document.activeElement;
            const inside = current instanceof HTMLElement && dialogRef.current?.contains(current);

            // Only the two edges need handling — in between, the browser's own
            // Tab order is already correct and matches the visual order.
            if (event.shiftKey && (!inside || current === first)) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && (!inside || current === last)) {
                event.preventDefault();
                first.focus();
            }
            return;
        }

        // Escape and Tab belong to the dialog, but the arrows and Enter drive
        // the combobox, so they only apply while focus is in the input. Once
        // focus moves to a control in the answer panel the browser's own
        // activation has to win — otherwise that control is reachable but not
        // operable, which is the worse of the two failures.
        if (event.target !== inputRef.current) {
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (options.length === 0) {
                return;
            }
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setActive((current) => (current + step + options.length) % options.length);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const selected = options[active];
            if (!selected) {
                return;
            }
            if (selected === 'ask') {
                void ask();
                return;
            }
            const command = commands.find((entry) => entry.id === selected);
            if (command) {
                runCommand(command);
            }
        }
    };

    const groups = results.reduce<Record<string, Array<PaletteCommand>>>((accumulator, command) => {
        (accumulator[command.group] ||= []).push(command);
        return accumulator;
    }, {});

    return (
        <div
            className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm'
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role='dialog'
                aria-modal='true'
                aria-label='Search and ask'
                onKeyDown={onKeyDown}
                className='w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl'
            >
                <div className='flex items-center gap-3 border-b border-line px-4 py-3.5'>
                    <svg
                        aria-hidden='true'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.9'
                        strokeLinecap='round'
                        className='h-4 w-4 shrink-0 text-accent'
                    >
                        <circle cx='11' cy='11' r='7' />
                        <path d='m20 20-3.5-3.5' />
                    </svg>

                    <input
                        ref={inputRef}
                        type='text'
                        role='combobox'
                        aria-expanded='true'
                        aria-controls='palette-listbox'
                        aria-activedescendant={options[active] ? `palette-option-${options[active]}` : undefined}
                        aria-label='Ask a question or jump to a section'
                        autoComplete='off'
                        placeholder={placeholder || FALLBACK_PLACEHOLDER}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className='min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted'
                    />

                    <kbd className='hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block'>
                        esc
                    </kbd>
                </div>

                <div className='max-h-[min(60vh,28rem)] overflow-y-auto'>
                    {
                        askState !== 'idle' &&
                        <div className='border-b border-line bg-bg/60 px-4 py-4'>
                            {
                                askState === 'asking' &&
                                <p
                                    role='status'
                                    className='font-mono text-xs text-muted'
                                >
                                    {messages.asking}
                                </p>
                            }

                            {
                                askState === 'throttled' &&
                                <p
                                    role='status'
                                    className='text-sm text-muted'
                                >
                                    {messages.throttled}
                                </p>
                            }

                            {
                                askState === 'unavailable' &&
                                <p
                                    role='status'
                                    className='text-sm text-muted'
                                >
                                    {messages.unavailable}
                                </p>
                            }

                            {
                                askState === 'answered' && answer &&
                                <div role='status'>
                                    <p className='eyebrow mb-2 text-accent'>
                                        Answer
                                    </p>
                                    {/* Typed to the eye, delivered whole to a
                                        screen reader: this is a live region, and
                                        animating text inside one announces it
                                        again on every character. */}
                                    <p className='text-sm leading-relaxed text-fg/90'>
                                        <span aria-hidden='true'>
                                            {typedAnswer}
                                            {!answerDone && <span className='terminal-cursor' />}
                                        </span>
                                        <span className='sr-only'>{answer.answer}</span>
                                    </p>
                                    {
                                        answer.sectionId &&
                                        <button
                                            type='button'
                                            onClick={() => {
                                                const target = answer.sectionId;
                                                onClose();
                                                if (target) {
                                                    void router.push(`#${target}`);
                                                }
                                            }}
                                            className='mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line
                                                       px-3 py-1.5 font-mono text-[11px] text-accent
                                                       transition-colors duration-200 hover:border-accent'
                                        >
                                            Take me there
                                            <span aria-hidden='true'>→</span>
                                        </button>
                                    }

                                </div>
                            }
                        </div>
                    }

                    <ul
                        id='palette-listbox'
                        role='listbox'
                        aria-label='Results'
                        className='py-2'
                    >
                        {
                            canAsk &&
                            <li
                                id='palette-option-ask'
                                role='option'
                                aria-selected={options[active] === 'ask'}
                                onMouseEnter={() => setActive(0)}
                                onClick={() => void ask()}
                                className={
                                    'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ' +
                                    (options[active] === 'ask' ? 'bg-line/50 text-fg' : 'text-muted')
                                }
                            >
                                <svg
                                    aria-hidden='true'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='1.8'
                                    strokeLinecap='round'
                                    className='h-4 w-4 shrink-0 text-accent'
                                >
                                    <path d='M12 3a4 4 0 0 0-4 4v1a3 3 0 0 0 0 6v1a4 4 0 0 0 8 0v-1a3 3 0 0 0 0-6V7a4 4 0 0 0-4-4Z' />
                                </svg>
                                <span className='min-w-0 flex-1 truncate'>
                                    {`Ask: “${query.trim()}”`}
                                </span>
                                <kbd className='font-mono text-[10px] text-muted'>
                                    ↵
                                </kbd>
                            </li>
                        }

                        {
                            Object.entries(groups).map(([group, entries]) => {
                                return (
                                    <li
                                        key={group}
                                        role='group'
                                        aria-label={group}
                                    >
                                        <p
                                            aria-hidden='true'
                                            className='eyebrow px-4 pb-1.5 pt-3 text-[10px] text-muted'
                                        >
                                            {group}
                                        </p>
                                        <ul role='presentation'>
                                            {
                                                entries.map((command: PaletteCommand) => {
                                                    const index = options.indexOf(command.id);
                                                    const selected = index === active;

                                                    return (
                                                        <li
                                                            key={command.id}
                                                            id={`palette-option-${command.id}`}
                                                            role='option'
                                                            aria-selected={selected}
                                                            onMouseEnter={() => setActive(index)}
                                                            onClick={() => runCommand(command)}
                                                            className={
                                                                'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ' +
                                                                (selected ? 'bg-line/50 text-fg' : 'text-muted')
                                                            }
                                                        >
                                                            <span className='min-w-0 flex-1 truncate'>
                                                                {command.label}
                                                            </span>
                                                            <span className='shrink-0 font-mono text-[10px] text-muted'>
                                                                {command.hint}
                                                            </span>
                                                        </li>
                                                    );
                                                })
                                            }
                                        </ul>
                                    </li>
                                );
                            })
                        }

                        {
                            /* The reply types itself out, which is the whole
                               joke — but only the finished string is exposed to
                               assistive tech. Animating text inside this list
                               would make a screen reader announce it once per
                               character. Reduced motion gets it instantly. */
                            terminalReply &&
                            <li className='px-4 py-6'>
                                <p className='font-mono text-sm text-accent'>
                                    <span aria-hidden='true'>
                                        {`$ ${command}`}
                                    </span>
                                </p>
                                <p className='mt-2 font-mono text-sm text-fg/90'>
                                    <span aria-hidden='true'>
                                        {typed}
                                        {!typedOut && <span className='terminal-cursor' />}
                                    </span>
                                    <span className='sr-only'>{terminalReply}</span>
                                </p>
                            </li>
                        }

                        {
                            !terminalReply && results.length === 0 && !canAsk &&
                            <li className='px-4 py-6 text-center text-sm text-muted'>
                                {messages.noMatch}
                            </li>
                        }
                    </ul>
                </div>

                <p className='flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 font-mono text-[10px] text-muted'>
                    <span>↑↓ navigate · ↵ select · esc close</span>
                    <span>{shortcut}</span>
                </p>
            </div>
        </div>
    );
}

export default CommandPalette;
