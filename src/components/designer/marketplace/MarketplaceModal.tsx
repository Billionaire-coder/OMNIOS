
import React, { useState } from 'react';
import { X, Upload, Tag, DollarSign, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface MarketplaceModalProps {
    onClose: () => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ onClose }) => {
    const [step, setStep] = useState<'details' | 'uploading' | 'success'>('details');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('0');
    const [tags, setTags] = useState('');

    const handlePublish = () => {
        setStep('uploading');
        // Mock upload delay
        setTimeout(() => {
            setStep('success');
        }, 2000);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 6000,
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '500px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '12px',
                overflow: 'hidden',
                color: 'white',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#111'
                }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Publish to Marketplace</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {step === 'details' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Preview Image Dropzone */}
                            <div style={{
                                height: '150px',
                                border: '2px dashed #333',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                backgroundColor: '#0f0f0f',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s'
                            }}>
                                <ImageIcon size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <span style={{ fontSize: '0.8rem' }}>Upload Preview Image</span>
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Template Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., SaaS Landing Page Kit"
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Price (USD)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        style={{ width: '100%', padding: '10px 10px 10px 30px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', display: 'block' }}>Set to 0 for Free</span>
                            </div>

                            {/* Tags */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>Tags</label>
                                <div style={{ position: 'relative' }}>
                                    <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="dark-mode, fintech, mobile-first"
                                        style={{ width: '100%', padding: '10px 10px 10px 30px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '6px', color: 'white' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-teal)', marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Packaging & Uploading...</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>Compressing assets to OMNIOS Cloud</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(46, 213, 115, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <Check size={32} color="#2ed573" />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2ed573' }}>Successfully Published!</h3>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px', textAlign: 'center' }}>
                                "{name}" is now live on the OMNIOS Marketplace.<br />
                                You can manage your listings in the Dashboard.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    backgroundColor: '#111'
                }}>
                    {step === 'details' && (
                        <>
                            <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                            <button onClick={handlePublish} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--accent-teal)', color: 'black', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={16} /> Publish Item
                            </button>
                        </>
                    )}
                    {step === 'success' && (
                        <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#333', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
