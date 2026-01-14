import React, { useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { AlertCircle, CheckCircle, Globe, ArrowRight, Settings, MousePointerClick } from 'lucide-react';
import { seoAuditor, AuditResult } from '@/lib/intelligence/seoAuditor';

export function SEODashboard() {
    const { state, setSelectedElement } = useProjectStore();

    // Run Audit
    const audit: AuditResult = useMemo(() => {
        return seoAuditor.auditProject(state);
    }, [state.elements, state.seo]);

    const getColor = (score: number) => {
        if (score >= 90) return '#00ff94';
        if (score >= 60) return '#ffaa00';
        return '#ff4444';
    };

    const handleFix = (action?: string, elementId?: string) => {
        if (action === 'select_element' && elementId) {
            setSelectedElement(elementId);
        }
        if (action === 'open_settings') {
            alert("Open SEO Settings Modal (Implementation Placeholder)"); // Connect to actual settings later
        }
    };

    return (
        <div className="glass" style={{ padding: '24px', color: 'white', width: '320px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Globe size={18} className="text-blue-400" /> SEO Pulse
                </h2>
                <div className={`px-2 py-1 rounded text-xs font-bold ${audit.score >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    Live Check
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mb-8 relative">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#333" strokeWidth="8" fill="none" />
                    <circle
                        cx="48" cy="48" r="40"
                        stroke={getColor(audit.score)}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * audit.score / 100)}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">{audit.score}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
                </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {audit.issues.length === 0 && audit.warnings.length === 0 && (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Perfect SEO Score!</span>
                    </div>
                )}

                {audit.issues.map((iss) => (
                    <div key={iss.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex gap-2 mb-2">
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-red-200 leading-tight">{iss.text}</span>
                        </div>
                        {iss.fixAction && (
                            <button
                                onClick={() => handleFix(iss.fixAction, iss.elementId)}
                                className="text-xs flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium ml-6 transition-colors"
                            >
                                {iss.fixAction === 'open_settings' ? <Settings size={12} /> : <MousePointerClick size={12} />}
                                {iss.fixAction === 'open_settings' ? 'Fix in Settings' : 'Select Element'}
                                <ArrowRight size={12} />
                            </button>
                        )}
                    </div>
                ))}

                {audit.warnings.map((warn) => (
                    <div key={warn.id} className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-3">
                        <div className="flex gap-2 mb-2">
                            <AlertCircle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-orange-200 leading-tight">{warn.text}</span>
                        </div>
                        {warn.fixAction === 'select_element' && (
                            <button
                                onClick={() => handleFix(warn.fixAction, warn.elementId)}
                                className="text-xs flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium ml-6 transition-colors"
                            >
                                <MousePointerClick size={12} /> Locate Element
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
