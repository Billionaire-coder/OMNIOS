"use client";

import React, { useState, useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import * as Icons from 'lucide-react';
import { Asset, AssetFolder } from '@/types/designer';
import { optimizeAsset } from '@/lib/assets/worker';
import { generateOptimizedAsset } from '@/lib/assets/optimizer'; // Framer18

export function AssetVault({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect?: (asset: Asset) => void }) {
    const { state, uploadAsset, deleteAsset, createFolder, updateAssetMetadata, createTeamLibrary, addAssetToLibrary } = useProjectStore();
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
    const [currentLibraryId, setCurrentLibraryId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Framer18: Folders Logic
    const folders = state.assetFolders.filter(f => f.parentId === currentFolderId);

    // Filter logic: If in a library, show library assets. Else if in a folder, show folder assets. Else show all? Or root?
    // Current logic was: root assets have folderId undefined.
    // Enhanced Logic:
    const displayedAssets = useMemo(() => {
        if (currentLibraryId) {
            const lib = state.teamLibraries?.find(l => l.id === currentLibraryId);
            if (!lib) return [];
            return state.assets.filter(a => lib.assetIds.includes(a.id));
        }
        return state.assets.filter(a => a.folderId === currentFolderId);
    }, [state.assets, state.teamLibraries, currentFolderId, currentLibraryId]);

    const filteredAssets = displayedAssets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedAsset = state.assets.find(a => a.id === selectedAssetId);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = async (event) => {
                const url = event.target?.result as string;
                const newAsset: Omit<Asset, 'id' | 'createdAt'> = {
                    name: file.name,
                    url: url,
                    type: file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other'),
                    size: file.size,
                    tags: [],
                    usage: 'ui',
                    folderId: currentFolderId,
                    altText: ''
                };

                const assetToUpload: Omit<Asset, 'id' | 'createdAt'> = newAsset;
                uploadAsset(assetToUpload);

                // Batch 6.2: Auto-Optimization simulation
                // Find the newly created asset (simulated)
                setTimeout(async () => {
                    const latestAsset = state.assets[state.assets.length - 1];
                    if (latestAsset) {
                        const optimized = await optimizeAsset(latestAsset) as any;
                        updateAssetMetadata(latestAsset.id, {
                            optimizedUrl: optimized.optimizedUrl,
                            size: optimized.optimizedSize
                        });
                    }
                }, 500);
            };
            reader.readAsDataURL(file);
        }
        setIsUploading(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '1200px',
                height: '80vh',
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                            <Icons.Library size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>ASSET VAULT</h2>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>CENTRAL MEDIA INTELLIGENCE</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <Icons.Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                type="text"
                                placeholder="Search assets or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '10px 10px 10px 35px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    width: '250px'
                                }}
                            />
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                            <Icons.X size={24} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Sidebar: Navigation */}
                    <aside style={{ width: '220px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' }}>NAVIGATE</div>

                        <button
                            onClick={() => setCurrentFolderId(undefined)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '10px',
                                background: !currentFolderId ? 'rgba(0, 255, 200, 0.1)' : 'none',
                                border: 'none',
                                color: !currentFolderId ? 'var(--accent-teal)' : '#888',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                marginBottom: '5px'
                            }}
                        >
                            <Icons.Grid size={16} /> All Assets
                        </button>

                        {state.assetFolders.filter(f => !f.parentId).map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setCurrentFolderId(folder.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px',
                                    background: currentFolderId === folder.id ? 'rgba(0, 255, 200, 0.1)' : 'none',
                                    border: 'none',
                                    color: currentFolderId === folder.id ? 'var(--accent-teal)' : '#888',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    marginBottom: '5px'
                                }}
                            >
                                <Icons.Folder size={16} /> {folder.name}
                            </button>
                        ))}

                        <div style={{ marginTop: 'auto' }}>
                            <button
                                onClick={() => {
                                    const name = prompt("Folder Name:");
                                    if (name) createFolder(name, currentFolderId);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: '#aaa',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-teal)')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                            >
                                <Icons.FolderPlus size={14} /> New Folder
                            </button>
                        </div>

                        {/* Framer18: Shared Team Libraries */}
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>TEAM LIBRARIES</span>
                                <button onClick={() => {
                                    const name = prompt("Library Name:");
                                    if (name) createTeamLibrary(name);
                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><Icons.Plus size={12} /></button>
                            </div>

                            {state.teamLibraries?.map(lib => (
                                <button
                                    key={lib.id}
                                    onClick={() => { setCurrentLibraryId(lib.id); setCurrentFolderId(undefined); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        width: '100%',
                                        padding: '10px',
                                        background: currentLibraryId === lib.id ? 'rgba(255, 200, 0, 0.1)' : 'none',
                                        border: 'none',
                                        color: currentLibraryId === lib.id ? 'var(--accent-gold)' : '#888',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        marginBottom: '5px'
                                    }}
                                >
                                    <Icons.BookOpen size={16} /> {lib.name}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content: Asset Grid */}
                    <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.75rem', color: '#444' }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setCurrentFolderId(undefined); setCurrentLibraryId(undefined); }}>Library</span>
                            {currentFolderId && (
                                <>
                                    <Icons.ChevronRight size={12} />
                                    <span>{state.assetFolders.find(f => f.id === currentFolderId)?.name}</span>
                                </>
                            )}
                            {currentLibraryId && (
                                <>
                                    <Icons.ChevronRight size={12} />
                                    <span>{state.teamLibraries?.find(l => l.id === currentLibraryId)?.name} (Shared)</span>
                                </>
                            )}
                        </div>

                        {/* Upload Zone */}
                        <div style={{
                            border: '2px dashed rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            marginBottom: '30px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-teal)';
                                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 200, 0.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                            }}
                        >
                            <input
                                type="file"
                                multiple
                                onChange={handleUpload}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />
                            <div style={{ color: 'var(--accent-teal)', marginBottom: '10px' }}><Icons.UploadCloud size={40} /></div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>Drag & drop assets here</div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>Support for Images, Videos, and SVG</div>
                        </div>

                        {/* Assets Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                            {filteredAssets.length === 0 && folders.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', color: '#444' }}>
                                    <Icons.Inbox size={48} style={{ marginBottom: '20px' }} />
                                    <div>No assets found in this folder.</div>
                                </div>
                            )}

                            {/* Folders (Only show if not in library mode) */}
                            {!currentLibraryId && folders.map(folder => (
                                <div
                                    key={folder.id}
                                    onDoubleClick={() => setCurrentFolderId(folder.id)}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                                >
                                    <Icons.Folder size={32} color="var(--accent-teal)" fill="var(--accent-teal)" fillOpacity={0.1} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ccc' }}>{folder.name}</span>
                                </div>
                            ))}

                            {filteredAssets.map(asset => (
                                <div
                                    key={asset.id}
                                    onClick={() => setSelectedAssetId(asset.id)}
                                    style={{
                                        backgroundColor: '#0f0f0f',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedAssetId === asset.id ? '2px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        height: '140px',
                                        backgroundColor: '#111',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundImage: asset.type === 'image' ? `url(${asset.url})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                        {asset.type === 'video' && <Icons.Play fill="white" size={32} />}
                                        {asset.type === 'other' && <Icons.FileText size={32} color="#444" />}
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '4px' }}>{(asset.size / 1024).toFixed(1)} KB</div>
                                    </div>

                                    {asset.optimizedUrl && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 6px', backgroundColor: 'var(--accent-teal)', color: 'black', fontSize: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            OPTIMIZED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </main>

                    {/* Right Panel: Metadata & Inspector */}
                    {selectedAssetId && (
                        <aside style={{ width: '300px', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '25px', overflowY: 'auto', backgroundColor: '#0a0a0a' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold', letterSpacing: '1px' }}>ASSET INFO</div>
                                <button onClick={() => setSelectedAssetId(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><Icons.X size={14} /></button>
                            </div>

                            {selectedAsset && (
                                <div>
                                    <div style={{
                                        width: '100%',
                                        height: '180px',
                                        borderRadius: '12px',
                                        backgroundColor: '#111',
                                        marginBottom: '20px',
                                        backgroundImage: selectedAsset.type === 'image' ? `url(${selectedAsset.url})` : 'none',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }} />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.65rem', color: '#666', marginBottom: '5px', display: 'block' }}>FILE NAME</label>
                                            <div style={{ fontSize: '0.8rem', color: 'white' }}>{selectedAsset.name}</div>
                                        </div>

                                        {/* Batch 6.3: Alt Text Injection */}
                                        <div>
                                            <label style={{ fontSize: '0.65rem', color: '#666', marginBottom: '5px', display: 'block' }}>ALT TEXT (SEO)</label>
                                            <textarea
                                                value={selectedAsset.altText || ''}
                                                onChange={(e) => updateAssetMetadata(selectedAsset.id, { altText: e.target.value })}
                                                placeholder="Describe this image for SEO..."
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    minHeight: '60px',
                                                    resize: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.65rem', color: '#666', marginBottom: '5px', display: 'block' }}>USAGE TYPE (OPTIMIZATION STRATEGY)</label>
                                            <select
                                                value={selectedAsset.usage}
                                                onChange={(e) => updateAssetMetadata(selectedAsset.id, { usage: e.target.value as any })}
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                <option value="ui">General UI (Balanced)</option>
                                                <option value="icon">Icon (High Compression)</option>
                                                <option value="background">Background (Maximum Quality)</option>
                                            </select>
                                        </div>

                                        {/* Framer18: Phase 2.1 - Optimization */}
                                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#888', marginBottom: '10px', fontWeight: 'bold' }}>OPTIMIZATION</div>

                                            {selectedAsset.isOptimized ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', fontSize: '0.75rem' }}>
                                                    <Icons.CheckCircle size={14} />
                                                    <span>Optimized ({(selectedAsset.optimizedSize && selectedAsset.size) ? Math.round((1 - selectedAsset.optimizedSize / selectedAsset.size) * 100) : 30}% saved)</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        const result = generateOptimizedAsset(selectedAsset);
                                                        updateAssetMetadata(selectedAsset.id, result);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '4px',
                                                        color: '#eee',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <Icons.Zap size={12} /> Compress & Optimize
                                                </button>
                                            )}
                                        </div>

                                        {/* Framer18: Phase 2.2 - Image Filters */}
                                        {selectedAsset.type === 'image' && (
                                            <div>
                                                <label style={{ fontSize: '0.65rem', color: '#666', marginBottom: '5px', display: 'block' }}>IMAGE FILTERS</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {['none', 'grayscale', 'sepia', 'contrast', 'vintage'].map(filter => (
                                                        <button
                                                            key={filter}
                                                            onClick={() => updateAssetMetadata(selectedAsset.id, { filterPreset: filter })}
                                                            style={{
                                                                padding: '6px',
                                                                backgroundColor: selectedAsset.filterPreset === filter ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                                color: selectedAsset.filterPreset === filter ? 'black' : '#888',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                cursor: 'pointer',
                                                                textTransform: 'capitalize'
                                                            }}
                                                        >
                                                            {filter}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {onSelect && (
                                            <button
                                                onClick={() => onSelect(selectedAsset)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: 'var(--accent-teal)',
                                                    color: 'black',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    marginTop: '10px'
                                                }}
                                            >
                                                <Icons.Check size={16} /> Select & Apply Asset
                                            </button>
                                        )}

                                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Delete this asset?")) {
                                                        deleteAsset(selectedAsset.id);
                                                        setSelectedAssetId(null);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: 'rgba(255, 50, 50, 0.1)',
                                                    color: '#ff4444',
                                                    border: '1px solid rgba(255, 50, 50, 0.2)',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <Icons.Trash2 size={14} /> Delete Asset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </aside>
                    )}
                </div>
            </div>
        </div >
    );
}
