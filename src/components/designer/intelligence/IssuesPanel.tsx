import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Search, Zap, Wand2 } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { DesignIntelligenceService } from '@/lib/intelligence/DesignIntelligenceService';
import { DesignIssue } from '@/types/intelligence';
import { LayoutSolver } from '@/lib/intelligence/LayoutSolver';

export const IssuesPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, setSelectedElement, updateElement } = useProjectStore();

    // Re-run analysis when state changes
    const issues = useMemo(() => {
        return DesignIntelligenceService.analyze(state);
    }, [state.pages, state.activePageId, state.engineMode]); // Dependency optimization

    const handleSelectIssue = (elementId: string) => {
        setSelectedElement(elementId);
    };

    const handleFixIssue = (e: React.MouseEvent, issue: DesignIssue) => {
        e.stopPropagation();
        if (issue.metadata?.fixType === 'auto-width') {
            const element = state.elements[issue.elementId];
            if (element) {
                const newStyles = LayoutSolver.solveMobileLayout(element);
                updateElement(issue.elementId, { styles: newStyles });
            }
        }
        if (issue.metadata?.fixType === 'use-token') {
            const prop = issue.metadata.prop;
            const token = issue.metadata.token;
            if (prop && token) {
                // Apply token as value (or variable syntax if supported) 
                // For now, let's keep the raw value but maybe in future we use variable reference.
                // Actually, if we want to "snap", we just ensure it is the exact token value.
                // But the checker found it because it was ALREADY the value.
                // So the "fix" here implies binding it explicitly or just acknowledging.
                // Let's assumme we want to bind it. updating styles.
                updateElement(issue.elementId, { styles: { [prop]: token.value } });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-10 bottom-0 w-80 bg-[#0f0f0f] border-l border-white/10 shadow-2xl z-40 flex flex-col font-sans"
        >
            <div className="h-10 border-b border-white/10 bg-[#141414] flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-white font-medium text-xs tracking-wider uppercase">
                    <Zap size={14} className="text-yellow-500" />
                    Design Intelligence
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 text-center gap-2">
                        <Check size={32} className="text-green-500/50" />
                        <p className="text-sm">No issues detected.</p>
                        <p className="text-xs">Your design looks great!</p>
                    </div>
                ) : (
                    issues.map(issue => (
                        <div
                            key={issue.id}
                            onClick={() => handleSelectIssue(issue.elementId)}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-colors group ${issue.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                                issue.severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
                                    'border-blue-500/30 bg-blue-500/5'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${issue.severity === 'critical' ? 'text-red-500' :
                                    issue.severity === 'warning' ? 'text-yellow-500' :
                                        'text-blue-500'
                                    }`}>
                                    <AlertTriangle size={14} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">{issue.message}</h4>
                                    <p className="text-[10px] text-white/60 leading-relaxed">{issue.description}</p>

                                    {issue.metadata?.ratio && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-4 w-4 rounded border border-white/20" style={{ backgroundColor: issue.metadata.bgColor }}>
                                                <span className="flex items-center justify-center h-full text-[8px]" style={{ color: issue.metadata.textColor }}>Aa</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-white/40">{issue.metadata.ratio.toFixed(2)}:1</span>
                                        </div>
                                    )}

                                    {issue.metadata?.fixType === 'auto-width' && (
                                        <button
                                            onClick={(e) => handleFixIssue(e, issue)}
                                            className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[10px] text-white/80 transition-colors"
                                        >
                                            <Wand2 size={10} />
                                            Auto-Fix Width
                                        </button>
                                    )}

                                    {issue.metadata?.fixType === 'use-token' && (
                                        <button
                                            onClick={(e) => handleFixIssue(e, issue)}
                                            className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[10px] text-white/80 transition-colors"
                                        >
                                            <Wand2 size={10} />
                                            Snap to '{issue.metadata.token.name}'
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#141414] text-[10px] text-white/30 text-center">
                Powered by OMNIOS Neural Engine v1.0
            </div>
        </motion.div>
    );
};
