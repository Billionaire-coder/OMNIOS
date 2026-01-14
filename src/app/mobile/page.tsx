"use client";

import React, { useState } from 'react';
import { useProjectStore, ProjectProvider } from '@/hooks/useProjectStore';
import { MobileReview } from '@/components/designer/mobile/MobileReview';
import { MobileComments } from '@/components/designer/mobile/MobileComments';
import { MobileAnalytics } from '@/components/designer/mobile/MobileAnalytics';
import { Layout, MessageSquare, BarChart3, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function MobileCompanionContent() {
    const [activeTab, setActiveTab] = useState<'review' | 'comments' | 'analytics'>('review');
    const { state, initializeProject, isInitialized } = useProjectStore();

    React.useEffect(() => {
        if (!isInitialized) {
            initializeProject({ id: 'blank' });
        }
    }, [isInitialized, initializeProject]);

    return (
        <div style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0a',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Mobile Header */}
            <header style={{
                padding: '16px',
                borderBottom: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/designer" style={{ color: '#888' }}>
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{state.name}</h1>
                        <span style={{ fontSize: '0.7rem', color: '#00ffd5' }}>Mobile Companion</span>
                    </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #00ffd5, #0088ff)' }} />
            </header>

            {/* Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {activeTab === 'review' && <MobileReview />}
                {activeTab === 'comments' && <MobileComments />}
                {activeTab === 'analytics' && <MobileAnalytics />}
            </main>

            {/* Bottom Tab Bar */}
            <nav style={{
                height: '70px',
                borderTop: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingBottom: 'env(safe-area-inset-bottom)',
                background: 'rgba(10, 10, 10, 0.95)'
            }}>
                <TabButton
                    active={activeTab === 'review'}
                    onClick={() => setActiveTab('review')}
                    icon={<Layout size={20} />}
                    label="Review"
                />
                <TabButton
                    active={activeTab === 'comments'}
                    onClick={() => setActiveTab('comments')}
                    icon={<MessageSquare size={20} />}
                    label="Comments"
                />
                <TabButton
                    active={activeTab === 'analytics'}
                    onClick={() => setActiveTab('analytics')}
                    icon={<BarChart3 size={20} />}
                    label="Insights"
                />
            </nav>
        </div>
    );
}

export default function MobileCompanionPage() {
    return (
        <ProjectProvider>
            <MobileCompanionContent />
        </ProjectProvider>
    );
}



function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: active ? '#00ffd5' : '#888',
                cursor: 'pointer',
                transition: 'color 0.2s'
            }}
        >
            {icon}
            <span style={{ fontSize: '0.65rem' }}>{label}</span>
        </button>
    );
}
