import React from 'react';

function Footer({ text }: FooterProps) {
    const year = new Date().getFullYear();

    return (
        <div
            className='relative flex flex-row justify-between bg-black p-6 md:p-8 lg:p-10'
        >
            <div
                className=''
            >
                <h1
                    className='font-bold text-gray-400'
                >
                    {`© ${year} ${text}`}
                </h1>
            </div>
        </div>
    );
}

export default Footer;