import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Reveal from '@/components/Reveal';

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

// Inline, like every other icon in this codebase. Pulling the icon library in
// for three glyphs cost 21 MB in the runtime image and was the only place the
// project drew icons from a package rather than drawing them.
const DETAIL_ICONS: Array<React.ReactNode> = [
    <><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' /></>,
    <><rect x='2' y='4' width='20' height='16' rx='2' /><path d='m2 7 10 6 10-6' /></>,
    <><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' /><circle cx='12' cy='10' r='3' /></>,
];

function Contact({ header, phone, email, headquarters, cta, status: statusLabels }: ContactProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInputs>();
    const [status, setStatus] = useState<SubmitStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const onSubmit: SubmitHandler<ContactInputs> = async (formData) => {
        setStatus('sending');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data: { message: string } = await response.json();

            if (!response.ok) {
                setStatus('error');
                setStatusMessage(data.message);
                return;
            }

            setStatus('success');
            setStatusMessage(data.message);
            reset();
        }
        catch {
            setStatus('error');
            setStatusMessage('Failed to send message. Please try again later.');
        }
    };

    const details = [
        { label: 'Phone', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` },
        { label: 'Email', value: email, href: `mailto:${email}` },
        { label: 'Based in', value: headquarters, href: undefined },
    ];

    return (
        <section
            id='contact'
            aria-labelledby='contact-heading'
            className='mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-24'
        >
            {/* Sunset over water: the one place the warm accent gets to run the
                full width, closing the page where it opened. */}
            <Reveal>
                <div className='rounded-3xl bg-gradient-to-br from-accent via-accent to-warm p-8 text-accent-ink md:p-12'>
                    <h2
                        id='contact-heading'
                        className='max-w-2xl text-3xl font-bold tracking-tight md:text-4xl'
                    >
                        {cta.header}
                    </h2>
                    <p className='mt-3 max-w-xl text-base leading-relaxed opacity-80 md:text-lg'>
                        {cta.invitation}
                    </p>
                    <a
                        href='#contact-form'
                        className='mt-7 inline-flex rounded-full bg-bg px-7 py-3.5 text-sm font-semibold text-accent
                                   transition duration-200 ease-shore hover:-translate-y-0.5
                                   motion-reduce:transform-none motion-reduce:transition-none'
                    >
                        {cta.buttonLabel}
                    </a>
                </div>
            </Reveal>

            <div className='mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14'>
                <Reveal>
                    <h3 className='text-xl font-semibold tracking-tight'>
                        {header}
                    </h3>

                    <ul className='mt-6 flex flex-col gap-5'>
                        {
                            details.map((detail, index) => {
                                return (
                                    <li
                                        key={detail.label}
                                        className='flex items-center gap-4'
                                    >
                                        <svg
                                            aria-hidden='true'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='1.8'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='h-5 w-5 shrink-0 text-accent'
                                        >
                                            {DETAIL_ICONS[index]}
                                        </svg>
                                        <span className='min-w-0'>
                                            <span className='block font-mono text-[11px] uppercase tracking-wider text-muted'>
                                                {detail.label}
                                            </span>
                                            {
                                                detail.href
                                                    ? <a
                                                        href={detail.href}
                                                        className='block text-[15px] [overflow-wrap:anywhere] hover:text-accent'
                                                    >
                                                        {detail.value}
                                                    </a>
                                                    : <span className='block text-[15px] [overflow-wrap:anywhere]'>
                                                        {detail.value}
                                                    </span>
                                            }
                                        </span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </Reveal>

                <Reveal>
                    <form
                        id='contact-form'
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-4'
                    >
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='min-w-0'>
                                <label
                                    htmlFor='contact-name'
                                    className='mb-1.5 block text-sm font-medium'
                                >
                                    Name
                                </label>
                                <input
                                    id='contact-name'
                                    type='text'
                                    className='contactInput'
                                    maxLength={100}
                                    autoComplete='name'
                                    aria-invalid={errors.name ? 'true' : 'false'}
                                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                                    {...register('name', { required: 'Name is required.' })}
                                />
                                {
                                    errors.name &&
                                    <p
                                        id='contact-name-error'
                                        role='alert'
                                        className='mt-1.5 text-sm text-warm'
                                    >
                                        {errors.name.message}
                                    </p>
                                }
                            </div>

                            <div className='min-w-0'>
                                <label
                                    htmlFor='contact-email'
                                    className='mb-1.5 block text-sm font-medium'
                                >
                                    Email
                                </label>
                                <input
                                    id='contact-email'
                                    type='email'
                                    className='contactInput'
                                    maxLength={254}
                                    autoComplete='email'
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                                    {...register('email', {
                                        required: 'Email is required.',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Enter a valid email address.',
                                        },
                                    })}
                                />
                                {
                                    errors.email &&
                                    <p
                                        id='contact-email-error'
                                        role='alert'
                                        className='mt-1.5 text-sm text-warm'
                                    >
                                        {errors.email.message}
                                    </p>
                                }
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor='contact-subject'
                                className='mb-1.5 block text-sm font-medium'
                            >
                                Subject
                            </label>
                            <input
                                id='contact-subject'
                                type='text'
                                className='contactInput'
                                maxLength={150}
                                aria-invalid={errors.subject ? 'true' : 'false'}
                                aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                                {...register('subject', { required: 'Subject is required.' })}
                            />
                            {
                                errors.subject &&
                                <p
                                    id='contact-subject-error'
                                    role='alert'
                                    className='mt-1.5 text-sm text-warm'
                                >
                                    {errors.subject.message}
                                </p>
                            }
                        </div>

                        <div>
                            <label
                                htmlFor='contact-message'
                                className='mb-1.5 block text-sm font-medium'
                            >
                                Message
                            </label>
                            <textarea
                                id='contact-message'
                                className='contactInput'
                                rows={6}
                                maxLength={5000}
                                aria-invalid={errors.message ? 'true' : 'false'}
                                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                                {...register('message', { required: 'Message is required.' })}
                            />
                            {
                                errors.message &&
                                <p
                                    id='contact-message-error'
                                    role='alert'
                                    className='mt-1.5 text-sm text-warm'
                                >
                                    {errors.message.message}
                                </p>
                            }
                        </div>

                        {/* One live region for every outcome, so a screen reader
                            announces the result without moving focus.

                            The terminal prefixes are decoration and are hidden
                            from assistive tech: "check mark colon colon" ahead of
                            every message is noise, and "establishing uplink" tells
                            a screen-reader user nothing about what is happening.
                            Each state therefore ships a plain sr-only sentence,
                            the same split the hero uses for its greeting. */}
                        <p
                            role='status'
                            className={
                                'font-mono text-sm ' +
                                (status === 'error' ? 'text-warm' : 'text-accent')
                            }
                        >
                            {
                                status === 'sending' &&
                                <>
                                    <span aria-hidden='true'>
                                        {`> ${statusLabels.sending}`}
                                        <span className='terminal-cursor' />
                                    </span>
                                    <span className='sr-only'>Sending your message…</span>
                                </>
                            }

                            {
                                (status === 'success' || status === 'error') &&
                                <>
                                    <span aria-hidden='true'>
                                        {status === 'success'
                                            ? `✓ ${statusLabels.success} :: `
                                            : `✗ ${statusLabels.error} :: `}
                                    </span>
                                    {statusMessage}
                                </>
                            }
                        </p>

                        <button
                            type='submit'
                            disabled={status === 'sending'}
                            className='btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
                        >
                            {status === 'sending' ? 'Sending…' : 'Send message'}
                        </button>
                    </form>
                </Reveal>
            </div>
        </section>
    );
}

export default Contact;
