"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Package, Calendar, Download, Settings } from 'lucide-react';
import { AuthWall } from '@/components/designer/membership/AuthWall';

export function CustomerDashboard({ className }: { className?: string }) {
    const { state } = useProjectStore();

    // Mock Order Data
    const orders = [
        { id: '#ORD-9921', date: 'Oct 24, 2025', total: 129.00, status: 'Delivered' },
        { id: '#ORD-9922', date: 'Nov 02, 2025', total: 45.50, status: 'Processing' },
    ];

    return (
        <AuthWall minTier="pro">
            <div className={className} style={{
                padding: '30px',
                backgroundColor: 'var(--bg-secondary, #111)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                color: 'white',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>My Account</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>Welcome back, Member.</p>
                    </div>
                    <div style={{ padding: '8px 16px', backgroundColor: 'var(--accent-teal)', color: 'black', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {state.userTier.toUpperCase()} PLAN
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#aaa' }}>
                            <Package size={18} /> <span>Recent Orders</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {orders.map(o => (
                                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span>{o.id}</span>
                                    <span style={{ color: o.status === 'Delivered' ? '#4CAF50' : '#FFC107' }}>{o.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#aaa' }}>
                            <Download size={18} /> <span>Digital Assets</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem' }}>E-Commerce UI Kit</span>
                                <button style={{ padding: '4px 10px', backgroundColor: '#333', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Download</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem' }}>Pro Icon Set</span>
                                <button style={{ padding: '4px 10px', backgroundColor: '#333', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthWall>
    );
}
