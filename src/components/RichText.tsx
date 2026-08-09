import React from 'react';

// Matches markdown-style links: [label](https://...). Only https URLs are
// accepted so content can't inject javascript: or other schemes.
const LINK_PATTERN = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g;

// Renders a content string, turning [label](https://url) spans into external
// links (new tab, safe rel) and leaving the rest as plain text. Keeps prose in
// the JSON content files while allowing the occasional verifiable link.
function RichText({ text }: { text: string }) {
    const nodes: Array<React.ReactNode> = [];
    let lastIndex = 0;

    // matchAll clones the regex internally, so it never mutates LINK_PATTERN's
    // lastIndex — safe to read module-level shared state during render.
    for (const match of text.matchAll(LINK_PATTERN)) {
        const index = match.index ?? 0;
        if (index > lastIndex) {
            nodes.push(text.slice(lastIndex, index));
        }
        const [, label, url] = match;
        nodes.push(
            <a
                key={index}
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='underline decoration-[#FF0000]/50 hover:text-[#FF0000] transition-colors'
            >
                {label}
            </a>
        );
        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return <>{nodes}</>;
}

export default RichText;
