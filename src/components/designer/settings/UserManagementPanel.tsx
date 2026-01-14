import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User as UserIcon, Check, MoreVertical, Search, X } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { RBACService } from '@/lib/auth/RBACService';
import { User } from '@/types/designer';
import { Role } from '@/types/rbac';

export const UserManagementPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, setState } = useProjectStore();
    const currentUser = state.currentUser;
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    // Mock loading users (In reality, fetch from PGlite/AuthService)
    useEffect(() => {
        // Simulating fetching users including current one
        setUsers([
            currentUser as User,
            { id: 'u2', email: 'alice@omnios.dev', role: 'editor', isAuthenticated: true, name: 'Alice Dev', avatar_url: '', metadata: {} },
            { id: 'u3', email: 'bob@omnios.dev', role: 'viewer', isAuthenticated: true, name: 'Bob Guest', avatar_url: '', metadata: {} },
            { id: 'u4', email: 'charlie@omnios.dev', role: 'admin', isAuthenticated: true, name: 'Charlie Admin', avatar_url: '', metadata: {} },
        ]);
        // TODO: Replace with AuthService.getAllUsers()
    }, [currentUser]);

    const handleRoleChange = (userId: string, newRole: Role) => {
        if (!RBACService.hasPermission(currentUser, 'users:write')) {
            alert("You do not have permission to manage users.");
            return;
        }

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

        // TODO: Persist via AuthService.updateUserRole(userId, newRole)
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-0 h-full w-96 bg-[#0f0f0f] border-l border-white/10 shadow-2xl z-[100] flex flex-col font-sans"
        >
            <div className="h-10 border-b border-white/10 bg-[#141414] flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-white font-medium text-xs tracking-wider uppercase">
                    <Shield size={14} className="text-purple-500" />
                    User Management
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredUsers.map(user => (
                    <div key={user.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white relative">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.email[0].toUpperCase()
                                )}
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f0f] ${user.role === 'owner' ? 'bg-yellow-500' : user.role === 'admin' ? 'bg-purple-500' : user.role === 'editor' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-white font-medium leading-none mb-1">{user.name || user.email.split('@')[0]}</span>
                                <span className="text-xs text-white/40">{user.email}</span>
                            </div>
                        </div>

                        <div className="relative group/role">
                            <button className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === 'owner' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                user.role === 'admin' ? 'border-purple-500/30 text-purple-500 bg-purple-500/10' :
                                    user.role === 'editor' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                                        'border-gray-500/30 text-gray-500 bg-gray-500/10'
                                }`}>
                                {user.role}
                            </button>

                            {/* Role Dropdown (Only visible if currentUser is admin/owner) */}
                            {RBACService.hasPermission(currentUser as User, 'users:write') && user.id !== currentUser?.id && (
                                <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover/role:block z-20">
                                    {(['admin', 'editor', 'viewer'] as Role[]).map(role => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleChange(user.id, role)}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center justify-between ${user.role === role ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                        >
                                            <span className="capitalize">{role}</span>
                                            {user.role === role && <Check size={10} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-white/10 text-[10px] text-center text-white/20">
                Only Admins can manage roles.
            </div>
        </motion.div>
    );
};
