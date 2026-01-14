
import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { LogicBlueprint, LogicNode, LogicConnection } from '../../types/designer';
import {
    X, Plus, Zap, Play, Database, ArrowRight, Settings, MousePointer2, Monitor, Layers, Code2,
    Camera, MapPin, Vibrate, Share2, Fingerprint, // Framer12
    Move, Hand, Maximize, Smartphone, // Gestures
    Globe, FileJson, GitMerge, // Framer14: Network & Data
    CloudFog, Timer, AlertOctagon, // Framer14: Serverless
    Briefcase, ShoppingBag, Contact, // Framer14: Enterprise
    Lock, ShieldCheck, CircleDot // Framer14: Secrets & Auth
} from 'lucide-react';

interface LogicCanvasProps {
    blueprint: LogicBlueprint;
    onClose: () => void;
}

export const LogicCanvas: React.FC<LogicCanvasProps> = ({ blueprint, onClose }) => {
    const { addLogicNode, moveLogicNode, removeLogicNode, addLogicConnection, removeLogicConnection, toggleBreakpoint, state } = useProjectStore();
    const isBreakpoint = (nodeId: string) => state.debugger.breakpoints.includes(nodeId);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // Framer14: Selection
    const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [showSecrets, setShowSecrets] = useState(false); // Framer14
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleAddNode = (type: string) => {
        addLogicNode(blueprint.id, type, { x: 100, y: 100 });
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#050505',
            zIndex: 5000,
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                height: '60px',
                borderBottom: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                justifyContent: 'space-between',
                backgroundColor: '#0a0a0a'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--accent-teal)', borderRadius: '8px', color: 'black' }}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Logic Blueprint</h2>
                        <span style={{ fontSize: '0.7rem', color: '#666' }}>ID: {blueprint.id}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Framer14: Secrets Manager */}
                    <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#222', border: '1px solid #333', color: '#ccc', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        <Lock size={14} />
                        Secrets
                    </button>
                    <button
                        onClick={() => alert("Opening Logic Blueprint Store...")}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'rgba(0, 224, 255, 0.1)', border: '1px solid rgba(0, 224, 255, 0.2)', color: 'var(--accent-teal)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <ShoppingBag size={14} />
                        Store
                    </button>
                    <button style={{ padding: '8px 16px', background: '#222', border: 'none', color: 'white', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Variables</button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
                </div>
            </div>

            {/* Framer14: Secrets Modal */}
            {showSecrets && (
                <div style={{ position: 'absolute', top: '70px', right: '20px', width: '300px', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '15px', zIndex: 6000, boxShadow: '0 10px 30px black' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-teal)' }}>Secret Store</h3>
                    <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '15px' }}>Values stored here are encrypted in backend (mocked).</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Key (e.g. STRIPE_KEY)" style={{ padding: '8px', background: '#050505', border: '1px solid #222', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }} />
                        <input type="password" placeholder="Value" style={{ padding: '8px', background: '#050505', border: '1px solid #222', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }} />
                        <button style={{ padding: '8px', background: 'var(--accent-teal)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', color: 'black' }}>
                            Save Secret
                        </button>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                {/* Left: Component Palette */}
                <div style={{ width: '240px', borderRight: '1px solid #1a1a1a', backgroundColor: '#080808', padding: '20px' }}>
                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Triggers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' }}>
                        <PaletteItem icon={<MousePointer2 size={14} />} label="On Click" onClick={() => handleAddNode('on_click')} color="var(--accent-teal)" />
                        <PaletteItem icon={<Play size={14} />} label="On Load" onClick={() => handleAddNode('on_load')} color="var(--accent-teal)" />
                        <PaletteItem icon={<Database size={14} />} label="On Data Update" onClick={() => handleAddNode('on_data')} color="var(--accent-teal)" />
                        <PaletteItem icon={<Timer size={14} />} label="On Idle (30s)" onClick={() => handleAddNode('on_idle')} color="var(--accent-teal)" />
                        <PaletteItem icon={<AlertOctagon size={14} />} label="On Tab Blur" onClick={() => handleAddNode('on_blur')} color="var(--accent-teal)" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Serverless</h3>
                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Serverless</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                        <PaletteItem icon={<CloudFog size={14} />} label="Cloud Function" onClick={() => handleAddNode('cloud_function')} color="#a55eea" />
                        <PaletteItem icon={<Timer size={14} />} label="Cron Job" onClick={() => handleAddNode('cron_job')} color="#a55eea" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Enterprise</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                        <PaletteItem icon={<Briefcase size={14} />} label="Salesforce Lead" onClick={() => handleAddNode('salesforce_lead')} color="#00a1e0" />
                        <PaletteItem icon={<ShoppingBag size={14} />} label="Shopify Cart" onClick={() => handleAddNode('shopify_cart')} color="#96bf48" />
                        <PaletteItem icon={<Contact size={14} />} label="HubSpot Contact" onClick={() => handleAddNode('hubspot_contact')} color="#ff7a59" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<ArrowRight size={14} />} label="Navigate" onClick={() => handleAddNode('navigate')} color="var(--accent-gold)" />
                        <PaletteItem icon={<Settings size={14} />} label="Set Variable" onClick={() => handleAddNode('set_var')} color="var(--accent-gold)" />
                        <PaletteItem icon={<Zap size={14} />} label="Play Animation" onClick={() => handleAddNode('play_anim')} color="var(--accent-gold)" />
                        <PaletteItem icon={<Code2 size={14} />} label="Component Ref" onClick={() => handleAddNode('component_ref')} color="#f0f" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Native API</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Camera size={14} />} label="Camera" onClick={() => handleAddNode('camera')} color="#ff4757" />
                        <PaletteItem icon={<MapPin size={14} />} label="Geolocation" onClick={() => handleAddNode('geolocation')} color="#2ed573" />
                        <PaletteItem icon={<Vibrate size={14} />} label="Haptics" onClick={() => handleAddNode('haptics')} color="#ffa502" />
                        <PaletteItem icon={<Share2 size={14} />} label="Share" onClick={() => handleAddNode('share')} color="#1e90ff" />
                        <PaletteItem icon={<Fingerprint size={14} />} label="Biometrics" onClick={() => handleAddNode('biometrics')} color="#5352ed" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Authentication</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Fingerprint size={14} />} label="Sign Up" onClick={() => handleAddNode('auth_signup')} color="#e056fd" />
                        <PaletteItem icon={<Lock size={14} />} label="Login" onClick={() => handleAddNode('auth_login')} color="#e056fd" />
                        <PaletteItem icon={<X size={14} />} label="Logout" onClick={() => handleAddNode('auth_logout')} color="#e056fd" />
                        <PaletteItem icon={<ShieldCheck size={14} />} label="Check Permission" onClick={() => handleAddNode('check_permission')} color="#e056fd" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Gestures</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Move size={14} />} label="On Swipe" onClick={() => handleAddNode('on_swipe')} color="#ff9f43" />
                        <PaletteItem icon={<Hand size={14} />} label="Long Press" onClick={() => handleAddNode('on_long_press')} color="#ff9f43" />
                        <PaletteItem icon={<Maximize size={14} />} label="Pinch Zoom" onClick={() => handleAddNode('on_pinch')} color="#ff9f43" />
                        <PaletteItem icon={<Smartphone size={14} />} label="Shake" onClick={() => handleAddNode('on_shake')} color="#ff9f43" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Network & Data</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Globe size={14} />} label="API Request" onClick={() => handleAddNode('api_request')} color="#00d2d3" />
                        <PaletteItem icon={<FileJson size={14} />} label="JSON Parse" onClick={() => handleAddNode('json_parse')} color="#54a0ff" />
                        <PaletteItem icon={<GitMerge size={14} />} label="Object Map" onClick={() => handleAddNode('object_map')} color="#5f27cd" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Ecosystem</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Code2 size={14} />} label="Script Node" onClick={() => handleAddNode('script')} color="#00ffd5" />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', marginTop: '30px' }}>Localization</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <PaletteItem icon={<Globe size={14} />} label="Locale Sensor" onClick={() => handleAddNode('locale_sensor')} color="var(--accent-teal)" />
                    </div>
                </div>

                {/* Main: Infinite Grid Canvas */}
                <div
                    ref={canvasRef}
                    style={{
                        flex: 1,
                        position: 'relative',
                        backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        cursor: draggingNodeId ? 'grabbing' : 'grab'
                    }}
                    onMouseMove={(e) => {
                        if (draggingNodeId && canvasRef.current) {
                            const rect = canvasRef.current.getBoundingClientRect();
                            const x = (e.clientX - rect.left - 90); // 90 is half width
                            const y = (e.clientY - rect.top - 20); // 20 is near top
                            moveLogicNode(blueprint.id, draggingNodeId, x, y);
                        }
                    }
                    }
                    onMouseUp={() => setDraggingNodeId(null)}
                >
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                        {blueprint.connections.map(conn => {
                            const fromNode = blueprint.nodes[conn.fromId];
                            const toNode = blueprint.nodes[conn.toId];
                            if (!fromNode || !toNode) return null;

                            // Calculate path (Simplified for now)
                            const x1 = fromNode.position.x + 180;
                            const y1 = fromNode.position.y + 40;
                            const x2 = toNode.position.x;
                            const y2 = toNode.position.y + 40;
                            const dx = Math.abs(x1 - x2) / 2;

                            return (
                                <g key={conn.id} onClick={() => removeLogicConnection(blueprint.id, conn.id)} style={{ cursor: 'pointer', pointerEvents: 'all' }}>
                                    <path
                                        d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2} `}
                                        stroke="var(--accent-teal)"
                                        strokeWidth="4"
                                        fill="none"
                                        style={{ opacity: 0.1 }}
                                    />
                                    <path
                                        d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2} `}
                                        stroke="var(--accent-teal)"
                                        strokeWidth="2"
                                        fill="none"
                                        style={{ opacity: 0.6 }}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {Object.values(blueprint.nodes).map(node => (
                        <div
                            key={node.id}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingNodeId(node.id);
                                setSelectedNodeId(node.id);
                            }}
                            style={{
                                position: 'absolute',
                                left: node.position.x,
                                top: node.position.y,
                                width: '180px',
                                background: selectedNodeId === node.id ? '#222' : '#111',
                                border: selectedNodeId === node.id ? '1px solid var(--accent-teal)' : '1px solid #333',
                                borderRadius: '8px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                cursor: 'grab',
                                zIndex: selectedNodeId === node.id ? 10 : 1
                            }}
                        >
                            <div style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid #222',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isBreakpoint(node.id) && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4757', boxShadow: '0 0 10px #ff4757' }} />
                                    )}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{node.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleBreakpoint(node.id); }}
                                        title="Toggle Breakpoint"
                                        style={{ background: 'none', border: 'none', color: isBreakpoint(node.id) ? '#ff4757' : '#444', cursor: 'pointer', padding: 0 }}
                                    >
                                        <CircleDot size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeLogicNode(blueprint.id, node.id); }}
                                        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 0 }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {node.inputs.map(pin => (
                                        <div key={pin} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#555', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '0.6rem', color: '#888' }}>In</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                                    {node.outputs.map(pin => (
                                        <div key={pin} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#888' }}>Out</span>
                                            <div style={{ width: '8px', height: '8px', background: 'var(--accent-teal)', borderRadius: '50%' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Node Inspector */}
            {selectedNodeId && blueprint.nodes[selectedNodeId] && (
                <div style={{ width: '300px', borderLeft: '1px solid #222', backgroundColor: '#080808', padding: '20px', overflowY: 'auto', zIndex: 100 }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px' }}>Node Properties</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>Node Name</label>
                            <input
                                type="text"
                                value={blueprint.nodes[selectedNodeId].name}
                                onChange={(e) => {
                                    // Update name (Need store action, but for MVP mock locally or direct mutation if supported)
                                    // blueprint.nodes[selectedNodeId].name = e.target.value; 
                                    const node = blueprint.nodes[selectedNodeId];
                                    // In a real app we'd dispatch an action. For MVP we can just let it be readonly or assume it works.
                                }}
                                className="glass-input"
                                style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        {/* API Request Config */}
                        {blueprint.nodes[selectedNodeId].type === 'api_request' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>Method</label>
                                    <select style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px' }}>
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>URL</label>
                                    <input type="text" placeholder="https://api.example.com" style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>Headers (JSON)</label>
                                    <textarea placeholder='{"Authorization": "Bearer..."}' style={{ width: '100%', height: '80px', padding: '8px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                                </div>
                            </>
                        )}

                        {/* Cloud Function Config */}
                        {blueprint.nodes[selectedNodeId].type === 'cloud_function' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>Function Code</label>
                                <textarea
                                    defaultValue={`// User Code\nconsole.log(input);\nalert('Hello');`}
                                    style={{ width: '100%', height: '200px', padding: '8px', background: '#111', border: '1px solid #333', color: '#a55eea', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                />
                            </div>
                        )}

                        {/* Script Node Config */}
                        {blueprint.nodes[selectedNodeId].type === 'script' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>Custom Logic (JS)</label>
                                <textarea
                                    defaultValue={blueprint.nodes[selectedNodeId].data?.code || `// Access variables via context.vars\n// Access UI via context.ui\n\nconsole.log("Hello from Script Node");`}
                                    style={{ width: '100%', height: '300px', padding: '8px', background: '#050505', border: '1px solid #333', color: '#00ffd5', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none' }}
                                    onBlur={(e) => {
                                        // Update node data (In a real app we'd trigger a save action)
                                        console.log("Saving script code:", e.target.value);
                                    }}
                                />
                                <button
                                    onClick={() => alert("Publishing Script Node as OMNIOS Asset...")}
                                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'rgba(0, 255, 213, 0.1)', border: '1px solid #00ffd5', color: '#00ffd5', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Publish to Marketplace
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #222', fontSize: '0.7rem', color: '#666' }}>
                            Node ID: {selectedNodeId}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PaletteItem = ({ icon, label, onClick, color }: { icon: any, label: string, onClick: () => void, color: string }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid #222',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
    >
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{label}</span>
    </div>
);
