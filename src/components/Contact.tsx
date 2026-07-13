import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/solid';
import TerminalWindow from '@/components/TerminalWindow';

export function buildMailtoUrl(email: string, formData: ContactInputs): string {
    return `mailto:${email}?subject=${formData.subject}&body=To whom it may concern,%0D%0A%0D%0AMy name is ${formData.name}.%0D%0A%0D%0A${formData.message}%0D%0A%0D%0A(${formData.email})`;
}

function Contact({ header, phone, email, headquarters }: ContactProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ContactInputs>();
    const onSubmit: SubmitHandler<ContactInputs> = (formData) => {
        window.location.href = buildMailtoUrl(email, formData);
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
            className='relative flex flex-col overflow-hidden min-h-screen text-center md:text-left md:flex-row max-w-7xl px-10 pb-36 md:pb-5 mx-auto justify-evenly items-center'
        >
            <h3
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
            >
                Contact
            </h3>

            <TerminalWindow
                path='~/contact'
                className='max-w-2xl'
            >
                <div
                    className='static flex flex-col space-y-10'
                >
                    <h4
                    className='text-2xl md:text-4xl font-semibold text-center pt-0 md:pt-20'
                >
                    <span
                        className='underline decoration-[#FF0000]/50'
                    >
                        {header}
                    </span>
                </h4>

                <div
                    className='space-y-10'
                >
                    <div
                        className='flex items-center space-x-5 justify-center'
                    >
                        <PhoneIcon
                            className='text-[#FF0000] w-7 h-7 animate-pulse'
                        />
                        <p
                            className='text-1xl md:text-2xl'
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
                            className='text-1xl md:text-2xl'
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
                            className='text-1xl md:text-2xl'
                        >
                            {headquarters}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='flex flex-col space-y-2 w-screen md:w-fit mx-auto p-5'
                >
                    <div
                        className='flex space-x-2'
                    >
                        <input
                            type='text'
                            className='contactInput'
                            placeholder='Name'
                            {...register('name', { required: 'Name is required.' })}
                        />
                        <input
                            type='email'
                            className='contactInput'
                            placeholder='Email'
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

                    <button
                        type='submit'
                        className='bg-[#FF0000] px-10 py-5 rounded-md text-black font-bold text-lg'
                    >
                        Submit
                    </button>
                </form>
                </div>
            </TerminalWindow>
        </motion.div>
    );
}

export default Contact;
