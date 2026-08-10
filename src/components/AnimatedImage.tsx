import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';

const MotionImage = motion.create(Image);

type Props = Pick<MotionProps, 'initial' | 'animate' | 'transition'> & {
    src: string;
    alt: string;
    // Intrinsic hint for the optimiser — the rendered size is still controlled
    // by `className`. Pass roughly 2x the largest CSS size so retina screens
    // get a sharp image without shipping the original.
    width: number;
    height: number;
    className?: string;
    // Tells the browser the CSS size at each breakpoint so it picks the right
    // srcset entry. Without it next/image assumes the image may be full-width
    // and over-fetches — a 256px box was pulling the 640px variant.
    sizes?: string;
};

// A raw <img> downloads the source file at full size: the About portrait alone
// was 2593x3527 / 11.8 MB to fill a ~256px box. Routing raster images through
// next/image resizes them and serves WebP instead.
//
// SVGs deliberately stay a plain <img>: sending them through the optimiser
// needs `dangerouslyAllowSVG`, and a same-origin SVG can carry script. Vectors
// are already resolution-independent, so there is nothing to gain either way.
function AnimatedImage({ src, alt, width, height, className, sizes, ...motionProps }: Props) {
    if (/\.svg$/i.test(src)) {
        return (
            <motion.img
                src={src}
                alt={alt}
                className={className}
                {...motionProps}
            />
        );
    }

    return (
        <MotionImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={className}
            {...motionProps}
        />
    );
}

export default AnimatedImage;
