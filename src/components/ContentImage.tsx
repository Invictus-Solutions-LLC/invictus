import React from 'react';
import Image from 'next/image';

type Props = {
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
    // and over-fetches.
    sizes?: string;
    priority?: boolean;
};

// A raw <img> downloads the source file at full size — the About portrait alone
// is 2593x3527. Routing raster images through next/image resizes them and
// serves WebP instead.
//
// SVGs deliberately stay a plain <img>: sending them through the optimiser
// needs `dangerouslyAllowSVG`, and a same-origin SVG can carry script. Vectors
// are already resolution-independent, so there is nothing to gain either way.
function ContentImage({ src, alt, width, height, className, sizes, priority }: Props) {
    if (/\.svg$/i.test(src)) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                decoding='async'
                className={className}
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            className={className}
        />
    );
}

export default ContentImage;
