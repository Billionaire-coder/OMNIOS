
'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GlobalError] Uncaught Exception:', error);
    }, [error]);

    return (
        <html>
            <body style={{
                backgroundColor: '#050505',
                color: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    padding: '40px',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    background: '#111',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h1 style={{ color: '#ff4d4d', marginBottom: '16px' }}>Critical System Error</h1>
                    <p style={{ marginBottom: '24px', opacity: 0.8 }}>
                        OMNIOS has encountered a critical error and needs to restart.
                        <br />
                        <small style={{ color: '#666' }}>{error.digest}</small>
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Restart Application
                    </button>
                </div>
            </body>
        </html>
    );
}
