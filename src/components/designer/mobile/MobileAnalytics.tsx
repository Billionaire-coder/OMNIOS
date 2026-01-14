"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export const MobileAnalytics = () => {
    const { state } = useProjectStore();

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#00ffd5" /> Mobile Insights
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <StatCard
                    icon={<Users size={20} color="#00ffd5" />}
                    label="Daily Active Users"
                    value="1,284"
                    trend="+12%"
                />
                <StatCard
                    icon={<Target size={20} color="#ff00ff" />}
                    label="Conversion Rate"
                    value="4.2%"
                    trend="+0.8%"
                />
                <StatCard
                    icon={<TrendingUp size={20} color="#0088ff" />}
                    label="Avg. Session Time"
                    value="3m 42s"
                    trend="-14s"
                />

                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    border: '1px solid #222'
                }}>
                    <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '16px' }}>LIVE PERFORMANCE</h3>
                    <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {[40, 60, 45, 90, 65, 30, 80, 55, 75, 50, 85, 40].map((h, i) => (
                            <div key={i} style={{
                                flex: 1,
                                height: `${h}%`,
                                backgroundColor: i === 10 ? '#00ffd5' : '#333',
                                borderRadius: '2px'
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
    return (
        <div style={{
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid #222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <div>
                    <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>{label}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</span>
                </div>
            </div>
            <span style={{
                fontSize: '0.75rem',
                color: trend.startsWith('+') ? '#00ffd5' : '#ff4444',
                fontWeight: 'bold'
            }}>{trend}</span>
        </div>
    );
}
