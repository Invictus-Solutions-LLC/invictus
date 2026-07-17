import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/solid';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

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
            className='relative flex flex-col overflow-hidden min-h-dvh md:h-dvh text-center md:text-left md:flex-row max-w-7xl px-10 pb-36 md:pb-5 mx-auto justify-evenly items-center'
        >
            <SectionPrompt
                label='Contact'
                command='cd ./contact'
                className='pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12'
            />

            <TerminalWindow
                path='~/contact'
                className='max-w-2xl w-full mt-10 md:self-stretch'
            >
                <div
                    className='static flex flex-col space-y-6'
                >
                    <h4
                    className='text-2xl md:text-4xl font-semibold text-center pt-0 md:pt-8'
                >
                    <span
                        className='underline decoration-[#FF0000]/50'
                    >
                        {header}
                    </span>
                </h4>

                <div
                    className='space-y-6'
                >
                    <div
                        className='flex items-center space-x-5 justify-center'
                    >
                        <PhoneIcon
                            className='text-[#FF0000] w-7 h-7 animate-pulse'
                        />
                        <p
                            className='text-base md:text-2xl min-w-0 [overflow-wrap:anywhere]'
                        >
                            {phone}
                        </p>
                    </div>

                    <div
                        className='flex items-center space-x-5 justify-center'
                    >
                        <EnvelopeIcon
                            className='text-[#FF0000] w-7 h-7 animate-pulse'
                        />
                        <p
                            className='text-base md:text-2xl min-w-0 [overflow-wrap:anywhere]'
                        >
                            {email}
                        </p>
                    </div>

                    <div
                        className='flex items-center space-x-5 justify-center'
                    >
                        <MapPinIcon
                            className='text-[#FF0000] w-7 h-7 animate-pulse'
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
                    className='flex flex-col space-y-2 w-full md:w-fit mx-auto p-2 md:p-5'
                >
                    <div
                        className='flex flex-col gap-2 sm:flex-row'
                    >
                        <input
                            type='text'
                            className='contactInput'
                            placeholder='Name'
                            maxLength={100}
                            {...register('name', { required: 'Name is required.' })}
                        />
                        <input
                            type='email'
                            className='contactInput'
                            placeholder='Email'
                            maxLength={254}
                            {...register('email', {
                                required: 'Email is required.',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Enter a valid email address.',
                                },
                            })}
                        />
                    </div>
                    {
                        (errors.name || errors.email) &&
                        <p
                            className='text-[#FF0000]/80 text-sm text-center'
                        >
                            {errors.name?.message || errors.email?.message}
                        </p>
                    }

                    <input
                        type='text'
                        className='contactInput'
                        placeholder='Subject'
                        maxLength={150}
                        {...register('subject', { required: 'Subject is required.' })}
                    />
                    {
                        errors.subject &&
                        <p
                            className='text-[#FF0000]/80 text-sm text-center'
                        >
                            {errors.subject.message}
                        </p>
                    }

                    <textarea
                        className='contactInput'
                        placeholder='Message'
                        maxLength={5000}
                        {...register('message', { required: 'Message is required.' })}
                    />
                    {
                        errors.message &&
                        <p
                            className='text-[#FF0000]/80 text-sm text-center'
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
                                className='text-[#FF0000]/70'
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
                            className='text-[#FF0000]/80 text-sm text-center'
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
                        className='bg-[#FF0000] px-10 py-4 rounded-md text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed'
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
