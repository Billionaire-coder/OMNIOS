import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LogOut, ChevronUp, Plus, Shield } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { User } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';

export const AuthSimulator = () => {
    const { state, setState } = useProjectStore();
    const { currentUser } = state.auth;
    const users = state.data.users || [];
    const [isOpen, setIsOpen] = useState(false);

    const switchUser = (user: User | null) => {
        setState({
            ...state,
            auth: {
                ...state.auth,
                currentUser: user
            }
        });
        setIsOpen(false);
    };

    const createUser = () => {
        const email = prompt("User Email:");
        if (email) {
            const newUser: User = {
                id: uuidv4(),
                email,
                role: 'editor',
                metadata: { name: email.split('@')[0] }
            };
            setState({
                ...state,
                data: {
                    ...state.data,
                    users: [...users, newUser]
                }
            });
            switchUser(newUser);
        }
    };

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="relative">
                {/* Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#141414] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                        >
                            <div className="p-2 border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#0f0f0f]">
                                Simulate Identity (RLS)
                            </div>

                            <div className="p-1 space-y-1">
                                {/* Guest Option */}
                                <button
                                    onClick={() => switchUser(null)}
                                    className={`w-full flex items-center px-3 py-2 rounded text-xs gap-3 ${!currentUser ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                                        <UserIcon size={12} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">Guest</div>
                                        <div className="text-[10px] opacity-50">Unauthenticated</div>
                                    </div>
                                    {!currentUser && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                </button>

                                {/* Users List */}
                                {users.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => switchUser(user)}
                                        className={`w-full flex items-center px-3 py-2 rounded text-xs gap-3 ${currentUser?.id === user.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                            {user.metadata.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{user.metadata.name || user.email}</div>
                                            <div className="text-[10px] opacity-50">{user.role}</div>
                                        </div>
                                        {currentUser?.id === user.id && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                    </button>
                                ))}
                            </div>

                            <div className="p-2 border-t border-white/10 bg-[#0f0f0f]">
                                <button
                                    onClick={createUser}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs text-teal-400 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20 transition-colors"
                                >
                                    <Plus size={12} /> Create Test User
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-lg transition-all ${currentUser
                        ? 'bg-indigo-900/80 border-indigo-500/50 text-indigo-100 hover:bg-indigo-900'
                        : 'bg-black/80 border-white/20 text-gray-300 hover:bg-black'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${currentUser ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />

                    <div className="flex flex-col items-start min-w-[100px]">
                        <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold">
                            Viewing As
                        </span>
                        <span className="text-xs font-medium truncate max-w-[120px]">
                            {currentUser ? (currentUser.metadata.name || currentUser.email) : 'Guest (Public)'}
                        </span>
                    </div>

                    <ChevronUp size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
};
