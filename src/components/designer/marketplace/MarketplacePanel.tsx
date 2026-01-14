
import React from 'react';
import { ShoppingBag, Box, Zap, Users, Star, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';

export const MarketplacePanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            {/* Header / Featured */}
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(0, 224, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                border: '1px solid rgba(0, 224, 255, 0.2)',
                borderRadius: '12px'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="var(--accent-teal)" /> OMNIOS Economy
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>
                    Scale your projects with community-driven templates, logic flows, and expert help.
                </p>
            </div>

            {/* Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <MarketCategory icon={<Box size={16} />} name="UI Kits" count="124" />
                <MarketCategory icon={<Zap size={16} />} name="Logic" count="42" />
                <MarketCategory icon={<Users size={16} />} name="Experts" count="15" />
                <MarketCategory icon={<ShoppingBag size={16} />} name="Bundles" count="8" />
            </div>

            {/* Featured Items */}
            <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Trending in Marketplace
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <MarketItem
                        name="SaaS Dashboard Kit"
                        author="OmniOS Pro"
                        price="$49"
                        rating="4.9"
                        tags={['Admin', 'Fintech']}
                    />
                    <MarketItem
                        name="Stripe Connect Flow"
                        author="LogicMaster"
                        price="FREE"
                        rating="5.0"
                        tags={['Payments', 'Logic']}
                    />
                </div>
            </div>

            {/* Hire an Expert CTA */}
            <div style={{
                marginTop: '10px',
                padding: '16px',
                backgroundColor: '#111',
                border: '1px solid #222',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
            }}>
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>Need custom logic?</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>Hire a certified OMNIOS Expert</div>
                </div>
                <ArrowRight size={16} color="#444" />
            </div>

            {/* EXPERTS DIRECTORY (Framer15 Phase 3) */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        Certified Experts
                    </h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', cursor: 'pointer' }}>View All</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <ExpertItem
                        name="Alex Rivera"
                        specialty="Logic & State"
                        rate="$80/hr"
                        rating="5.0"
                    />
                    <ExpertItem
                        name="Sarah Chen"
                        specialty="Visual Design"
                        rate="$120/hr"
                        rating="4.9"
                    />
                </div>
            </div>
        </div>
    );
};

const MarketCategory = ({ icon, name, count }: { icon: any, name: string, count: string }) => (
    <div style={{
        padding: '12px',
        backgroundColor: '#111',
        border: '1px solid #222',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.backgroundColor = '#151515'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.backgroundColor = '#111'; }}
    >
        <div style={{ color: 'var(--accent-teal)' }}>{icon}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{name}</div>
        <div style={{ fontSize: '0.65rem', color: '#666' }}>{count} items</div>
    </div>
);

const MarketItem = ({ name, author, price, rating, tags }: { name: string, author: string, price: string, rating: string, tags: string[] }) => (
    <div style={{
        padding: '12px',
        backgroundColor: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: '8px',
        cursor: 'pointer'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{name}</div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>by {author}</div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: price === 'FREE' ? '#2ed573' : 'white' }}>{price}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {tags.map(t => (
                <span key={t} style={{ fontSize: '0.6rem', padding: '2px 6px', backgroundColor: '#222', color: '#888', borderRadius: '4px' }}>{t}</span>
            ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#FFD700' }}>
            <Star size={10} fill="#FFD700" /> {rating}
        </div>
    </div>
);

const ExpertItem = ({ name, specialty, rate, rating }: { name: string, specialty: string, rate: string, rating: string }) => (
    <div style={{
        padding: '12px',
        backgroundColor: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#888" />
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {name} <ShieldCheck size={12} color="var(--accent-teal)" />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{specialty}</div>
            </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{rate}</div>
            <div style={{ fontSize: '0.65rem', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                <Star size={8} fill="#FFD700" /> {rating}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    alert(`Invitation sent to ${name}! They will be able to join your project directly.`);
                }}
                style={{
                    marginTop: '4px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 224, 255, 0.1)',
                    border: '1px solid rgba(0, 224, 255, 0.2)',
                    color: 'var(--accent-teal)',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Invite to Project
            </button>
        </div>
    </div>
);
