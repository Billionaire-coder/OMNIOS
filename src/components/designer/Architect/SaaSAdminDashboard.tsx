
import React, { useState, useMemo } from 'react';
import {
    Shield,
    Users,
    Database,
    Zap,
    Search,
    Activity,
    TrendingUp,
    MoreVertical,
    UserPlus,
    ExternalLink,
    Lock,
    Globe,
    X,
    LayoutDashboard,
    CreditCard,
    DollarSign,
    Package
} from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Button } from '@/components/ui/button';
import { Tenant } from '@/types/designer';

export const SaaSAdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, setActiveTenantId, updateTenant, addTenant } = useProjectStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'overview' | 'tenants' | 'billing'>('overview');

    const tenants = state.tenants || [];

    // Filtered Tenants
    const filteredTenants = useMemo(() => {
        return tenants.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tenants, searchQuery]);

    // Global Metrics
    const metrics = useMemo(() => ({
        totalTenants: tenants.length,
        activeUsers: tenants.reduce((acc, t) => acc + (t.usage.users || 0), 0),
        totalRecords: tenants.reduce((acc, t) => acc + (t.usage.records || 0), 0),
        systemHealth: 'Optimal',
        revenue: tenants.length * 99 // Mock $99 per tenant
    }), [tenants]);

    const handleImpersonate = (tenantId: string) => {
        setActiveTenantId(tenantId);
        onClose(); // Close dashboard to enter the tenant context
    };

    const handleAddTenant = () => {
        const id = `tn-${Math.random().toString(36).substr(2, 9)}`;
        const newTenant: Tenant = {
            id,
            name: 'Acme Corp',
            slug: 'acme',
            ownerId: 'user-001',
            status: 'active',
            createdAt: Date.now(),
            usage: { users: 0, records: 0, apiCalls: 0 }
        };
        addTenant(newTenant);
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Super Admin Header */}
            <div className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                        <Shield className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            SuperAdmin Console
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-black tracking-widest uppercase">Platform Authority</span>
                        </h1>
                        <p className="text-[11px] text-white/30 uppercase tracking-[0.3em] font-bold">Multi-Tenant OS // Nexus v4.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                        <button
                            onClick={() => setView('overview')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${view === 'overview' ? 'bg-amber-600 text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setView('tenants')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${view === 'tenants' ? 'bg-amber-600 text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            Manage Tenants
                        </button>
                        <button
                            onClick={() => setView('billing')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${view === 'billing' ? 'bg-amber-600 text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            Billing & Plans
                        </button>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10 mx-2" />
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5 rounded-2xl">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {view === 'overview' ? (
                    <div className="max-w-6xl mx-auto space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'Total Tenants', value: metrics.totalTenants, icon: Globe, color: 'text-indigo-400' },
                                { label: 'Active Users', value: metrics.activeUsers, icon: Users, color: 'text-emerald-400' },
                                { label: 'Data Objects', value: metrics.totalRecords, icon: Database, color: 'text-amber-400' },
                                { label: 'Monthly Revenue', value: `$${metrics.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-rose-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <s.icon className="w-16 h-16" />
                                    </div>
                                    <s.icon className={`w-5 h-5 mb-4 ${s.color}`} />
                                    <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest">{s.label}</h3>
                                    <p className="text-3xl font-black text-white mt-1 tracking-tighter">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity & System Health */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Global Platform Activity
                                </h2>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">New Tenant Onboarded</p>
                                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Acme Digital // 4 mins ago</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest text-indigo-400 hover:text-indigo-300">DETAILS</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/[0.04] border border-amber-500/10 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/[0.02]" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-amber-500/60 mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> System Vitals
                                </h2>
                                <div className="space-y-6 relative">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">
                                            <span>API LATENCY</span>
                                            <span className="text-emerald-400">24MS</span>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">
                                            <span>DB LOAD</span>
                                            <span className="text-amber-400">12%</span>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-amber-500 w-[12%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : view === 'tenants' ? (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by Tenant Name or Slug..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-all font-bold"
                                />
                            </div>
                            <Button onClick={handleAddTenant} className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-8 h-12 rounded-2xl gap-2 shadow-xl shadow-amber-600/20 uppercase tracking-widest">
                                <UserPlus className="w-4 h-4" /> New Tenant
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredTenants.length > 0 ? filteredTenants.map(t => (
                                <div key={t.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all hover:bg-white/[0.05]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                                            <Globe className="w-6 h-6 text-white/40 group-hover:text-white transition-colors relative" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-tight">{t.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{t.slug}.omnios.app</p>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-current uppercase flex items-center gap-1 ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    <Lock className="w-2 h-2" /> {t.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 text-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Users</p>
                                            <p className="text-xl font-black text-white">{t.usage.users}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Records</p>
                                            <p className="text-xl font-black text-white">{t.usage.records}</p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-6">
                                            <Button
                                                onClick={() => handleImpersonate(t.id)}
                                                className="bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl gap-2 border border-white/10 group-hover:border-amber-500/30 group-hover:text-amber-400 transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Impersonate
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white rounded-xl">
                                                <MoreVertical className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 flex flex-col items-center justify-center text-white/5 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                    <LayoutDashboard className="w-20 h-20 mb-6" />
                                    <h3 className="text-xl font-black uppercase tracking-[0.4em]">Nexus Clear</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">No tenants matching your search query</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Subscription & Revenue Engine</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-1 bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Pricing Plans</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Starter', price: '$29', limit: '1,000 Records', color: 'bg-emerald-500/20 text-emerald-400' },
                                        { name: 'Professional', price: '$99', limit: '10,000 Records', color: 'bg-indigo-500/20 text-indigo-400' },
                                        { name: 'Enterprise', price: 'Custom', limit: 'Unlimited', color: 'bg-rose-500/20 text-rose-400' },
                                    ].map((plan, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-white">{plan.name}</p>
                                                <p className="text-[10px] text-white/20">{plan.limit}</p>
                                            </div>
                                            <div className={`text-[10px] font-black px-3 py-1 rounded-lg ${plan.color}`}>{plan.price}/MO</div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl border border-white/5">Configure Stripe Products</Button>
                            </div>

                            <div className="col-span-2 bg-white/[0.02] border border-white/5 p-8 rounded-3xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <DollarSign className="w-32 h-32" />
                                </div>
                                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Revenue Performance</h3>
                                <div className="flex items-end gap-2 h-48 mb-8">
                                    {[40, 60, 45, 90, 100, 80, 120].map((h, i) => (
                                        <div key={i} className="flex-1 bg-indigo-500/20 border-t border-indigo-500/40 rounded-t-lg transition-all hover:bg-indigo-500/40 relative group" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                OCT {20 + i}: ${h * 10}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Annual Run Rate</p>
                                        <p className="text-xl font-black text-emerald-400">$142,400</p>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Churn Rate</p>
                                        <p className="text-xl font-black text-indigo-400">1.2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
