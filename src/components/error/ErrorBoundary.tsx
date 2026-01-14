
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string; // To identify which boundary caught the error
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary] Caught error in ${this.props.name || 'Component'}:`, error, errorInfo);
        // TODO: Send to Sentry/LogRocket here in Batch 1.3.2
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    padding: '24px',
                    backgroundColor: 'rgba(255, 50, 50, 0.05)',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                    borderRadius: '12px',
                    color: '#ff6b6b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <AlertCircle size={32} />
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Something went wrong</h3>
                        {this.props.name && <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Source: {this.props.name}</p>}
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: 'rgba(255, 50, 50, 0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
