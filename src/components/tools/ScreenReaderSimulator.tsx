'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ScreenReaderSimulator({ isActive }: { isActive: boolean }) {
    const [focusedElement, setFocusedElement] = useState<{
        role: string;
        name: string;
        rect: DOMRect;
    } | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.design-canvas')) {
                setFocusedElement(null);
                return;
            }

            // Simple Accessibility Compute Logic
            let role = target.getAttribute('role') || target.tagName.toLowerCase();
            let name = target.getAttribute('aria-label') ||
                target.getAttribute('alt') ||
                target.innerText?.substring(0, 50) ||
                "Unlabeled";

            if (target.tagName === 'IMG' && !name) name = "Unlabeled Image";
            if (target.tagName === 'BUTTON' && !name) name = "Unlabeled Button";

            const rect = target.getBoundingClientRect();

            setFocusedElement({ role, name, rect });
        };

        document.addEventListener('mousemove', handleHover);
        return () => document.removeEventListener('mousemove', handleHover);
    }, [isActive]);

    if (!isActive || !focusedElement) return null;

    // Render Portal Overlay
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: focusedElement.rect.top - 50,
                left: focusedElement.rect.left,
                zIndex: 9999,
                pointerEvents: 'none'
            }}
            className="bg-black/90 text-white px-4 py-2 rounded-lg border-l-4 border-yellow-400 shadow-xl backdrop-blur-md max-w-xs"
        >
            <div className="flex flex-col">
                <span className="text-[10px] items-center gap-2 font-mono uppercase text-yellow-400 tracking-wider flex">
                    SR Output
                    <span className="bg-yellow-400/20 px-1 rounded text-yellow-200">{focusedElement.role}</span>
                </span>
                <span className="font-bold text-lg leading-tight mt-1">
                    "{focusedElement.name}"
                </span>
            </div>
            {/* Visual focus ring */}
            <div
                style={{
                    position: 'fixed',
                    top: focusedElement.rect.top,
                    left: focusedElement.rect.left,
                    width: focusedElement.rect.width,
                    height: focusedElement.rect.height,
                    border: '2px solid #fbbf24',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    zIndex: 9998
                }}
            />
        </div>,
        document.body
    );
}
