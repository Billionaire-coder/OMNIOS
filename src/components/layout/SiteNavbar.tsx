"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNavbar() {
    const pathname = usePathname();

    // Hide Navbar on designer and editor routes
    const isEditor = pathname?.startsWith('/designer') || pathname?.startsWith('/editor');

    if (isEditor) return null;

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: '0',
            width: '100%',
            height: '70px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            borderBottom: '1px solid var(--glass-border)',
            borderRadius: '0'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>
                OMNI<span style={{ color: 'var(--accent-gold)' }}>OS</span>
            </div>
            <div style={{ display: 'flex', gap: '30px' }}>
                <Link href="/designer" style={{ color: 'var(--text-secondary)' }}>Features</Link>
                <button style={{ color: 'var(--text-secondary)' }}>Showcase</button>
                <button style={{ color: 'var(--text-secondary)' }}>Pricing</button>
            </div>
            <Link href="/designer" className="glass" style={{
                padding: '10px 25px',
                background: 'var(--accent-gold)',
                color: 'black',
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                Get Started
            </Link>
        </nav>
    );
}
