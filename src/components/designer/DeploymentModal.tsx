import React, { useState } from 'react';
import { X, Check, Globe, Zap, ArrowRight, Loader2 } from 'lucide-react';

// Batch 7.5: Confetti Trigger
import { useCollaboration } from '@/hooks/useCollaboration';
import { useProjectStore } from '@/hooks/useProjectStore';

export const DeploymentModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState<'config' | 'deploying' | 'success'>('config');
    const [target, setTarget] = useState<'web' | 'mobile'>('web'); // Framer12: Web vs Mobile toggle
    const [logs, setLogs] = useState<string[]>([]);
    const { broadcastEvent } = useCollaboration();

    const [providerToken, setProviderToken] = useState<string>('');
    const { state, deployProject, connectProvider, disconnectProvider } = useProjectStore();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        setLogs(prev => [...prev, "Initiating OAuth handshake with Vercel..."]);
        try {
            await connectProvider('vercel');
            setLogs(prev => [...prev, "✅ Account connected: OMNIOS Developer"]);
        } catch (e) {
            setLogs(prev => [...prev, "❌ Connection failed."]);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDeploy = async () => {
        const token = state.deployment.token || providerToken;
        if (!token && !state.deployment.isConnected) {
            alert("Please connect your Vercel account or enter an API token.");
            return;
        }

        setStep('deploying');
        setLogs([]);

        if (target === 'mobile') {
            // ... Existing Mobile Logic (Mock) ...
            // For consistency we should probably move mobile to a service too, but for this Batch 7.1 we focus on Vercel/Netlify web.
            // Let's keep the existing mobile mock for now as it wasn't the focus of this batch.
            const steps = [
                "Connecting to EAS (Expo Application Services)...",
                "Validating React Native compatibility...",
                "Checking Native API linkages...",
                "Bundling JS (Hermes Engine)...",
                "Building iOS Archive (.ipa)...",
                "Building Android Bundle (.aab)...",
                "Signing binaries...",
                "Uploading to Distribution..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                if (i >= steps.length) {
                    clearInterval(interval);
                    setStep('success');
                } else {
                    setLogs(prev => [...prev, steps[i]]);
                    i++;
                }
            }, 800);
            return;
        }

        // Web Deployment via Service
        if (target === 'web') {
            // We can use 'vercel' or 'netlify'. Let's add a sub-toggle or just default to Vercel for now, or add a selector.
            // The UI shows "Vercel Integration" title. Let's make it selectable.
            const result = await deployProject('vercel', token || undefined);
            if (result.success) {
                setStep('success');
                // Trigger Confetti
                broadcastEvent('GO_LIVE', { version: 'v1.0' });
            } else {
                setLogs(prev => [...prev, `Error: Deployment Failed. Check logs.`]);
                // Stay on deploying or move to error state? 
                // Simple: just show error log.
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '600px',
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                {/* HEAD */}
                <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Globe color="white" size={20} />
                        <h2 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold', margin: 0 }}>Deploy to Global Edge</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {/* BODY */}
                <div style={{ padding: '40px' }}>
                    {step === 'config' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', backgroundColor: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
                                    <div style={{ fontSize: '2rem' }}>{target === 'web' ? '▲' : '📱'}</div>
                                </div>
                                <div>
                                    <h3 style={{ color: 'white', margin: '0 0 5px 0' }}>{target === 'web' ? 'Vercel Integration' : 'App Store Connect (EAS)'}</h3>
                                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                                        {target === 'web' ? 'Deploy serverless functions and static assets to 35+ regions.' : 'Build and submit IPA/APK binaries to Apple & Google Stores.'}
                                    </p>
                                </div>
                            </div>

                            {/* TARGET TOGGLE */}
                            <div className="flex bg-[#222] p-1 rounded-lg">
                                <button
                                    onClick={() => setTarget('web')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${target === 'web' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Web Deployment
                                </button>
                                <button
                                    onClick={() => setTarget('mobile')}
                                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${target === 'mobile' ? 'bg-[var(--accent-teal)] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Native Mobile App
                                </button>
                            </div>

                            <div style={{ padding: '20px', backgroundColor: 'rgba(0,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--accent-teal)', fontSize: '0.8rem', fontWeight: 'bold' }}>{target === 'web' ? 'PROJECT SETTINGS' : 'BUILD CONFIGURATION'}</span>
                                </div>
                                {target === 'web' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Connection Flow (Batch 6.1) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '10px' }}>
                                            {!state.deployment.isConnected ? (
                                                <button
                                                    onClick={handleConnect}
                                                    disabled={isConnecting}
                                                    style={{
                                                        width: '100%', padding: '12px', borderRadius: '8px',
                                                        backgroundColor: 'black', border: '1px solid #333',
                                                        color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                                    }}
                                                >
                                                    {isConnecting ? <Loader2 size={16} className="spin" /> : '▲'} Connect Vercel
                                                </button>
                                            ) : (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid #333', borderRadius: '8px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>OD</div>
                                                        <div>
                                                            <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>{state.deployment.accountName || 'Connected'}</div>
                                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>Personal Account</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={disconnectProvider}
                                                        style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.8rem', cursor: 'pointer' }}
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            )}

                                            {!state.deployment.isConnected && (
                                                <div style={{ textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            const token = prompt("Enter manual Vercel API Token:");
                                                            if (token) setProviderToken(token);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                                    >
                                                        or enter token manually
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Framework Preset</span>
                                            <span style={{ color: 'white' }}>Next.js (App Router)</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Root Directory</span>
                                            <span style={{ color: 'white' }}>/</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Build Command</span>
                                            <span style={{ color: 'white', fontFamily: 'monospace' }}>next build</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Bundle Identifier</span>
                                            <span style={{ color: 'white' }}>com.omnios.app</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Version</span>
                                            <span style={{ color: 'white' }}>1.0.0 (Build 42)</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#888' }}>Targets</span>
                                            <span style={{ color: 'white' }}>iOS, Android</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDeploy}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '8px', border: 'none',
                                    backgroundColor: target === 'web' ? 'white' : 'var(--accent-teal)',
                                    color: 'black', fontWeight: 'bold', fontSize: '1rem',
                                    cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                <Zap size={18} fill="black" /> {target === 'web' ? 'Deploy Now' : 'Start Cloud Build'}
                            </button>
                        </div>
                    )}

                    {step === 'deploying' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Loader2 size={24} className="spin" color="var(--accent-teal)" />
                                <h3 style={{ color: 'white', margin: 0 }}>Building & Deploying...</h3>
                            </div>
                            <div style={{
                                backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px',
                                padding: '20px', height: '200px', overflowY: 'auto', fontFamily: 'monospace',
                                color: '#aaa', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '5px'
                            }}>
                                {logs.map((log, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#444' }}>{new Date().toLocaleTimeString()}</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                                <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={40} color="black" strokeWidth={3} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Deployment Complete!</h3>
                                <p style={{ color: '#888', margin: 0 }}>Your site is now live on the generic Edge Network.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#222', padding: '10px 20px', borderRadius: '30px', border: '1px solid #444', marginTop: '10px' }}>
                                <Globe size={16} color="var(--accent-teal)" />
                                {target === 'web' ? (
                                    <a href="https://omnios-demo.vercel.app" target="_blank" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>omnios-demo.vercel.app</a>
                                ) : (
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>Builds Ready: v1.0.0.ipa / v1.0.0.apk</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                                <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                                {target === 'web' ? (
                                    <button onClick={() => window.open('https://omnios-demo.vercel.app', '_blank')} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Visit Site <ArrowRight size={16} style={{ verticalAlign: 'middle' }} /></button>
                                ) : (
                                    <button onClick={() => alert("Simulated IPA/APK Download Started!")} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-teal)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Download Binaries ⬇</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div >
    );
};
