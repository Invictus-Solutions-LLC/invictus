import React from 'react';

type Props = { children: React.ReactNode };
type State = { failed: boolean };

// A render error anywhere in the tree unmounts the whole app and leaves a blank
// page — the worst possible failure for a site whose job is to be read. This
// turns that into a page that still says who it belongs to and offers a way
// forward.
//
// Deliberately depends on nothing: no content, no hooks, no icons. Whatever
// broke, this has to be able to render.
class ErrorBoundary extends React.Component<Props, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    componentDidCatch(error: Error) {
        // Server-side logs already carry render errors; this covers the client,
        // where the only other record would be the visitor's own console.
        console.error('[ui] render failed:', error.message);
    }

    render() {
        if (!this.state.failed) {
            return this.props.children;
        }

        return (
            <main className='flex min-h-dvh w-full items-center justify-center px-6 py-16'>
                <div className='w-full max-w-md text-center'>
                    <p className='eyebrow text-warm'>
                        Something broke
                    </p>
                    <h1 className='mt-3 text-2xl font-semibold tracking-tight'>
                        This page stopped working.
                    </h1>
                    <p className='mt-4 text-base leading-relaxed text-muted'>
                        It has been logged, and it wasn&apos;t your fault. Reloading usually fixes it.
                    </p>
                    {/* Deliberately a plain anchor, not next/link: a client-side
                        navigation would keep the broken React tree alive. Only a
                        full document load actually recovers. */}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                        href='/'
                        className='btn-primary mt-8'
                    >
                        Reload the page
                    </a>
                </div>
            </main>
        );
    }
}

export default ErrorBoundary;
