
import React, { useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { MessageSquare, Check, X, Send, MoreHorizontal, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsOverlayProps {
    canvasTransform: { x: number, y: number, scale: number };
    isCommentMode: boolean;
    activeBlueprintId?: string | null;
    onOpenBlueprint?: (id: string) => void;
}

export function CommentsOverlay({ canvasTransform, isCommentMode, activeBlueprintId, onOpenBlueprint }: CommentsOverlayProps) {
    const { comments, addComment, resolveComment, user } = useCollaboration();
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [newCommentPos, setNewCommentPos] = useState<{ x: number, y: number } | null>(null);
    const [inputValue, setInputValue] = useState('');

    // Transform world coordinates to screen coordinates
    const toScreen = (x: number, y: number) => ({
        x: x * canvasTransform.scale + canvasTransform.x,
        y: y * canvasTransform.scale + canvasTransform.y
    });

    // Transform screen coordinates to world coordinates (for placing new comments)
    const toWorld = (x: number, y: number) => ({
        x: (x - canvasTransform.x) / canvasTransform.scale,
        y: (y - canvasTransform.y) / canvasTransform.scale
    });

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (!isCommentMode) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const worldPos = toWorld(e.clientX - rect.left, e.clientY - rect.top);
        setNewCommentPos(worldPos);
    };

    const submitComment = () => {
        if (!inputValue.trim() || !newCommentPos) return;

        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            content: inputValue,
            position: newCommentPos,
            author: {
                name: user.name,
                color: user.color,
                avatar: user.name[0]
            },
            createdAt: Date.now(),
            resolved: false,
            replies: [],
            context: activeBlueprintId ? { type: 'blueprint', id: activeBlueprintId } : undefined
        };

        addComment(newComment);
        setInputValue('');
        setNewCommentPos(null);
    };

    return (
        <div
            className={`absolute inset-0 z-50 overflow-hidden ${isCommentMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            onClick={handleOverlayClick}
            // Context menu is also fine, but Click is better for "Tool Mode"
            onContextMenu={(e) => {
                if (isCommentMode) {
                    e.preventDefault();
                    handleOverlayClick(e);
                }
            }}
        >
            {isCommentMode && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20 backdrop-blur-md">
                    Click anywhere to comment
                </div>
            )}
            {/* Render Existing Comments */}
            {comments.filter(c => !c.resolved).map((comment) => {
                const screenPos = toScreen(comment.position.x, comment.position.y);
                const isActive = activeThreadId === comment.id;

                return (
                    <div
                        key={comment.id}
                        className="absolute pointer-events-auto"
                        style={{
                            transform: `translate(${screenPos.x}px, ${screenPos.y}px)`,
                        }}
                    >
                        {/* Marker */}
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setActiveThreadId(isActive ? null : comment.id)}
                            className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                            style={{
                                marginTop: '-32px', // Bottom-center anchor
                                marginLeft: '-16px',
                                backgroundColor: isActive ? '#2563EB' : comment.author.color
                            }}
                        >
                            {isActive ? <X size={14} /> : <div className="text-xs font-bold text-white">{comment.author.avatar}</div>}
                        </motion.button>

                        {/* Thread Popover */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-2 left-4 w-64 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl overflow-hidden flex flex-col"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black" style={{ backgroundColor: comment.author.color }}>
                                                {comment.author.avatar}
                                            </div>
                                            <span className="text-xs font-bold text-white">{comment.author.name}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <button
                                            onClick={() => resolveComment(comment.id)}
                                            className="text-gray-400 hover:text-green-500 transition-colors"
                                            title="Resolve"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 text-sm text-gray-200">
                                        {comment.content}
                                        {comment.context?.type === 'blueprint' && (
                                            <div
                                                className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded cursor-pointer hover:bg-blue-500/20 border border-blue-500/20 w-fit"
                                                onClick={() => onOpenBlueprint && onOpenBlueprint(comment.context.id)}
                                            >
                                                <Brain size={12} />
                                                <span>Linked to Logic Blueprint</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reply Input (Mock) */}
                                    <div className="p-2 border-t border-white/10 bg-black/20">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Reply..."
                                                className="w-full bg-[#333] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <button className="absolute right-1 top-1 text-blue-500">
                                                <Send size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* New Comment Input */}
            {newCommentPos && (
                <div
                    className="absolute pointer-events-auto"
                    style={{
                        transform: `translate(${toScreen(newCommentPos.x, newCommentPos.y).x}px, ${toScreen(newCommentPos.x, newCommentPos.y).y}px)`
                    }}
                >
                    <div className="bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl p-3 w-64 -mt-32 -ml-32">
                        <textarea
                            autoFocus
                            className="w-full bg-transparent text-white text-sm resize-none focus:outline-none mb-2"
                            placeholder="Write a comment..."
                            rows={3}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitComment();
                                }
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setNewCommentPos(null)}
                                className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitComment}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded flex items-center gap-1"
                            >
                                Send <Send size={10} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
