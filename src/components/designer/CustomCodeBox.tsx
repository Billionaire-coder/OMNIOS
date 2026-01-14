import React, { useEffect, useMemo, useState } from 'react';
import { ElementStyles } from '@/types/designer';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { componentRegistry } from '../../lib/runtime/ComponentRegistry';

interface CustomCodeBoxProps {
    id: string;
    code: string;
    exposedProps?: Record<string, any>;
    styles?: ElementStyles;
    className?: string;
}

export const CustomCodeBox: React.FC<CustomCodeBoxProps> = ({ id, code, exposedProps = {}, styles = {}, className }) => {
    const [Component, setComponent] = useState<React.FC<any> | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Clean up registry when component unmounts
    useEffect(() => {
        return () => {
            componentRegistry.unregister(id);
        };
    }, [id]);

    useEffect(() => {
        try {
            // Very simple transform: Convert "export default function..." to a returnable function
            // or assume the user writes `return (props) => ...`
            // For a better UX, we'll try to wrap their code.

            let evalCode = code;

            // Simple heuristic to handle "export default function" or "const X ="
            // Ideally, we'd use a real transpiler like `sucrase` in the browser.
            // For this MVP, we assume the user provides a Functional Component Body or an IIFE that returns a component.

            // If code contains "export default", try to extract it? 
            // Too complex for Regex.
            // Let's assume the user writes:
            // (props) => { return <div {...props}>Hello</div> }
            // OR
            // function Component(props) { return <div>Hello</div> } return Component;

            // We provide React in scope.
            const scope = {
                React,
                ...LucideIcons,
                registerMethods: (methods: any) => componentRegistry.register(id, methods)
            };
            const scopeKeys = Object.keys(scope);
            const scopeValues = Object.values(scope);

            const factory = new Function(...scopeKeys, `
                try {
                    ${evalCode}
                } catch(e) {
                    throw e;
                }
            `);

            const result = factory(...scopeValues);

            if (typeof result === 'function') {
                setComponent(() => result);
                setError(null);
            } else {
                throw new Error("Code must return a React Component function.");
            }

        } catch (err: any) {
            console.error("Custom Code Error:", err);
            setError(err.message);
        }
    }, [code]);

    if (error) {
        return (
            <div style={{ ...styles, border: '1px solid red', padding: '10px', color: 'red', overflow: 'auto', fontSize: '0.8rem' }} className={className}>
                <strong>Render Error:</strong>
                <pre>{error}</pre>
            </div>
        );
    }

    if (!Component) {
        return <div style={styles} className={className}>Loading Custom Code...</div>;
    }

    // Merge styles into props if the component accepts them?
    // Usually custom components want full control, but the wrapper applies positioning.
    // We pass styles as `style` prop just in case.
    return (
        <div style={styles} className={className}>
            <Component {...exposedProps} />
        </div>
    );
};
