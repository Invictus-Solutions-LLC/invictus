import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/solid';

function Contact({ header, phone, email, headquarters }: ContactProps) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ContactInputs>();
    const onSubmit: SubmitHandler<ContactInputs> = (formData) => {
        window.location.href = `mailto:[REDACTED]?subject=${formData.subject}&body=To whom it may concern,%0D%0A%0D%0AMy name is ${formData.name}.%0D%0A%0D%0A${formData.message}%0D%0A%0D%0A(${formData.email})`;
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
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
            >
                Contact
            </h3>

            <div
                className='static flex flex-col space-y-10 pt-5'
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
                            {...register('name')}
                        />
                        <input
                            type='email'
                            className='contactInput'
                            placeholder='Email'
                            {...register('email')}
                        />
                    </div>

                    <input
                        type='text'
                        className='contactInput'
                        placeholder='Subject'
                        {...register('subject')}
                    />

                    <textarea
                        className='contactInput'
                        placeholder='Message'
                        {...register('message')}
                    />

                    <button
                        type='submit'
                        className='bg-[#FF0000] px-10 py-5 rounded-md text-black font-bold text-lg'
                    >
                        Submit
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

export default Contact;
