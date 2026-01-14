import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export function AssetManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [assets, setAssets] = useState([
        { id: '1', name: 'Hero BG.jpg', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', type: 'image' },
        { id: '2', name: 'Icon-Teal.png', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', type: 'image' },
        { id: '3', name: 'Product Reveal.mp4', url: '#', type: 'video' }
    ]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '25px',
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1000,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}
            >
                <Icons.FolderOpen size={20} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden'
        }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Asset Manager</h3>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                    <Icons.X size={18} />
                </button>
            </div>

            <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
                <div style={{
                    border: '2px dashed #222',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    color: '#666',
                    fontSize: '0.8rem'
                }}>
                    <Icons.UploadCloud size={24} style={{ marginBottom: '10px' }} />
                    <div>Drop files to upload</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {assets.map(asset => (
                        <div key={asset.id} style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'border 0.2s'
                        }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-teal)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                        >
                            <div style={{
                                height: '80px',
                                backgroundColor: '#222',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: asset.type === 'image' ? `url(${asset.url})` : 'none',
                                backgroundSize: 'cover'
                            }}>
                                {asset.type === 'video' && <Icons.PlayCircle size={24} color="#666" />}
                            </div>
                            <div style={{ padding: '8px', fontSize: '0.7rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {asset.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
