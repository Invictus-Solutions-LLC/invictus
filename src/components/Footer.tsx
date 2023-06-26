import React from 'react';

type Props = {};

function Footer({ }: Props) {
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
                    &copy; 2023 Invictus808. All Rights Reserved.
                </h1>
            </div>
        </div>
    );
}

export default Footer;