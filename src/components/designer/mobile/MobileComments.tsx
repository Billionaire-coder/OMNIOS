"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

export const MobileComments = () => {
    const [comments, setComments] = useState([
        { id: 1, user: 'Saif', text: 'Love the new hero section!', time: '2m ago' },
        { id: 2, user: 'Alex', text: 'Can we try a darker teal?', time: '1h ago' },
        { id: 3, user: 'Sarah', text: 'Mobile padding looks great now.', time: '5h ago' }
    ]);
    const [newComment, setNewComment] = useState('');

    const handleSend = () => {
        if (!newComment.trim()) return;
        setComments([{
            id: Date.now(),
            user: 'You',
            text: newComment,
            time: 'Just now'
        }, ...comments]);
        setNewComment('');
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '80px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="#00ffd5" /> Design Discussion
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {comments.map(comment => (
                        <div key={comment.id} style={{
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px solid #222'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#00ffd5' }}>{comment.user}</span>
                                <span style={{ fontSize: '0.65rem', color: '#666' }}>{comment.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#eee', lineHeight: '1.4' }}>{comment.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Bar */}
            <div style={{
                position: 'fixed',
                bottom: '80px',
                left: 0,
                right: 0,
                padding: '16px',
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #222',
                display: 'flex',
                gap: '12px'
            }}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                        flex: 1,
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#00ffd5',
                        border: 'none',
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};
