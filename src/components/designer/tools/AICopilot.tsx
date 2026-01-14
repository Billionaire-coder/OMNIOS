import React, { useState, useEffect, useRef } from 'react';
import { useAIExecutor } from '@/hooks/useAIExecutor';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ContextEngine } from '@/lib/ai/ContextEngine';
import { Bot, Send, X, Sparkles, Zap, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

interface AICopilotProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isOpen, onClose }) => {
    const { state } = useProjectStore();
    const { execute } = useAIExecutor();

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your OMNIOS Copilot. I can see your project context. How can I help you design today?', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [contextSummary, setContextSummary] = useState({ page: '', selection: 0 });
    const [isContextExpanded, setIsContextExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update Context Indicator when state changes
    useEffect(() => {
        if (!isOpen) return;

        // Debounce context gathering to avoid heavy computations on every render
        const timer = setTimeout(() => {
            const ctx = ContextEngine.gather(state);
            setContextSummary({
                page: ctx.page.name,
                selection: ctx.selection.length
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [state, isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Batch 6.3: Mock Logic Engine -> Executor
            // In the future, this comes from the LLM
            console.log("[AICopilot] Analyzing request:", input);

            setTimeout(() => {
                // Mock Decision: If user says "red", turn selected element red
                const isRedRequest = input.toLowerCase().includes('red');
                const isBlueRequest = input.toLowerCase().includes('blue');

                let feedback = "I've processed your request.";

                if ((isRedRequest || isBlueRequest) && state.selectedElementId) {
                    const color = isRedRequest ? '#ff4d4d' : '#3b82f6';
                    const action = {
                        type: 'update_style',
                        payload: {
                            elementId: state.selectedElementId,
                            styles: { backgroundColor: color }
                        }
                    };

                    const results = execute([action as any]);
                    if (results[0]?.success) {
                        feedback = `I've updated the background color to ${isRedRequest ? 'red' : 'blue'} for you!`;
                    } else {
                        feedback = "I tried to update the style, but something went wrong.";
                    }
                } else if (!state.selectedElementId) {
                    feedback = "Please select an element first so I know what to modify.";
                } else {
                    feedback = "I heard you, but I only know how to make things 'red' or 'blue' right now!";
                }

                const responseMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: feedback,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, responseMsg]);
                setIsLoading(false);
            }, 800);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 right-6 w-96 h-[600px] glass border border-white/10 rounded-xl flex flex-col shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-black/80"
                >
                    {/* Header */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Copilot</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                            <X size={16} className="text-white/60" />
                        </button>
                    </div>

                    {/* Context Ribbon */}
                    <div className="bg-blue-500/5 border-b border-blue-500/10 px-4 py-2 flex flex-col gap-2">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsContextExpanded(!isContextExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <Brain size={12} className="text-blue-400" />
                                <span className="text-[10px] font-medium text-blue-300 uppercase tracking-widest">
                                    Context Active
                                </span>
                            </div>
                            {isContextExpanded ? <ChevronUp size={12} className="text-blue-400" /> : <ChevronDown size={12} className="text-blue-400" />}
                        </div>

                        {isContextExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="text-[10px] text-white/60 pl-5 space-y-1"
                            >
                                <p>• Page: <span className="text-white">{contextSummary.page}</span></p>
                                <p>• Selection: <span className="text-white">{contextSummary.selection} items</span></p>
                                <p>• Strategy: <span className="text-green-400">Compressed Tree</span></p>
                            </motion.div>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Copilot to change something..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <Sparkles size={10} className="text-white/20" />
                            <span className="text-[10px] text-white/20">Powered by OMNIO-7B</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
