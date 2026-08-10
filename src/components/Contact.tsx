import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/solid';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

// Like Skills, the heading stays stacked on top at every width. From lg the
// content beneath splits so the contact details sit beside the form rather than
// above it, keeping the whole form visible without scrolling the terminal body.
function Contact({ header, phone, email, headquarters }: ContactProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInputs>();
    const [status, setStatus] = useState<SubmitStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const onSubmit: SubmitHandler<ContactInputs> = async (formData) => {
        setStatus('sending');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            whileInView={{
                opacity: 1,
            }}
            transition={{
                duration: 1.5,
            }}
            className='relative flex flex-col overflow-hidden min-h-dvh md:h-dvh text-center md:text-left max-w-7xl px-10 pt-16 md:pt-20 lg:pt-24 pb-36 md:pb-5 mx-auto items-center'
        >
            <SectionPrompt
                label='Contact'
                command='cd ./contact'
                className='pb-4 md:pb-6'
            />

            <TerminalWindow
                path='~/contact'
                className='w-full flex-1 min-h-0'
            >
                <h3
                    className='text-2xl md:text-4xl font-semibold text-center'
                >
                    <span
                        className='underline decoration-terminal-red/50'
                    >
                        {header}
                    </span>
                </h3>

                <div
                    className='mt-8 md:mt-10 grid gap-8 lg:gap-10 lg:grid-cols-5 lg:items-center'
                >
                    <div
                        className='space-y-6 lg:col-span-2'
                    >
                        <div
                            className='flex items-center space-x-5 justify-center lg:justify-start'
                        >
                            <PhoneIcon
                                className='text-terminal-red w-7 h-7 flex-shrink-0 animate-pulse motion-reduce:animate-none'
                            />
                            <p
                                className='text-base md:text-2xl min-w-0 [overflow-wrap:anywhere]'
                            >
                                {phone}
                            </p>
                        </div>

                        <div
                            className='flex items-center space-x-5 justify-center lg:justify-start'
                        >
                            <EnvelopeIcon
                                className='text-terminal-red w-7 h-7 flex-shrink-0 animate-pulse motion-reduce:animate-none'
                            />
                            <p
                                className='text-base md:text-2xl min-w-0 [overflow-wrap:anywhere]'
                            >
                                {email}
                            </p>
                        </div>

                        <div
                            className='flex items-center space-x-5 justify-center lg:justify-start'
                        >
                            <MapPinIcon
                                className='text-terminal-red w-7 h-7 flex-shrink-0 animate-pulse motion-reduce:animate-none'
                            />
                            <p
                                className='text-base md:text-2xl min-w-0 [overflow-wrap:anywhere]'
                            >
                                {headquarters}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col space-y-2 w-full lg:col-span-3'
                    >
                        <div
                            className='flex flex-col gap-2 sm:flex-row'
                        >
                            <div
                                className='flex-1 min-w-0'
                            >
                                <label
                                    htmlFor='contact-name'
                                    className='sr-only'
                                >
                                    Name
                                </label>
                                <input
                                    id='contact-name'
                                    type='text'
                                    className='contactInput'
                                    placeholder='Name'
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
                                        className='text-terminal-red text-sm mt-1'
                                    >
                                        {errors.name.message}
                                    </p>
                                }
                            </div>

                            <div
                                className='flex-1 min-w-0'
                            >
                                <label
                                    htmlFor='contact-email'
                                    className='sr-only'
                                >
                                    Email
                                </label>
                                <input
                                    id='contact-email'
                                    type='email'
                                    className='contactInput'
                                    placeholder='Email'
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
                                        className='text-terminal-red text-sm mt-1'
                                    >
                                        {errors.email.message}
                                    </p>
                                }
                            </div>
                        </div>

                        <label
                            htmlFor='contact-subject'
                            className='sr-only'
                        >
                            Subject
                        </label>
                        <input
                            id='contact-subject'
                            type='text'
                            className='contactInput'
                            placeholder='Subject'
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
                                className='text-terminal-red text-sm'
                            >
                                {errors.subject.message}
                            </p>
                        }

                        <label
                            htmlFor='contact-message'
                            className='sr-only'
                        >
                            Message
                        </label>
                        <textarea
                            id='contact-message'
                            className='contactInput'
                            placeholder='Message'
                            rows={5}
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
                                className='text-terminal-red text-sm'
                            >
                                {errors.message.message}
                            </p>
                        }

                        {
                            status === 'sending' &&
                            <p
                                role='status'
                                className='text-gray-400 text-sm text-center'
                            >
                                <span
                                    className='text-terminal-red'
                                >
                                    {'> '}
                                </span>
                                establishing uplink... transmitting
                                <span
                                    className='terminalCursor'
                                />
                            </p>
                        }
                        {
                            status === 'success' &&
                            <p
                                role='status'
                                className='text-terminal-green text-sm text-center'
                            >
                                {'✓ transmission complete :: '}
                                <span>
                                    {statusMessage}
                                </span>
                            </p>
                        }
                        {
                            status === 'error' &&
                            <p
                                role='status'
                                className='text-terminal-red text-sm text-center'
                            >
                                {'✗ transmission failed :: '}
                                <span>
                                    {statusMessage}
                                </span>
                            </p>
                        }

                        <button
                            type='submit'
                            disabled={status === 'sending'}
                            className='bg-[#FF0000] px-10 py-4 rounded-md text-black font-bold text-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {status === 'sending' ? './send.sh --wait' : 'Submit'}
                        </button>
                    </form>
                </div>
            </TerminalWindow>
        </motion.div>
    );
}

export default Contact;
