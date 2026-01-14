
import React, { useState, useEffect } from 'react';
import { X, Search, Package, Globe, Download, Check, Loader2, Sparkles, Zap, Shield, ExternalLink, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { MarketplaceService, MarketplacePlugin } from '@/lib/plugins/MarketplaceService';
import { NpmService, NpmSearchResult } from '@/lib/plugins/NpmService';
import { Button } from '@/components/ui/button';

interface PluginMarketplaceProps {
    onClose: () => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ onClose }) => {
    const { state, installPlugin, uninstallPlugin } = useProjectStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'featured' | 'npm' | 'installed'>('featured');
    const [results, setResults] = useState<MarketplacePlugin[]>([]);
    const [npmResults, setNpmResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [installingId, setInstallingId] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'featured' && !searchQuery) {
            handleLoadFeatured();
        }
    }, [activeTab]);

    const handleLoadFeatured = async () => {
        setLoading(true);
        try {
            const featured = await MarketplaceService.getFeaturedPlugins();
            setResults(featured);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (activeTab === 'npm') {
                const data = await NpmService.search(searchQuery);
                setNpmResults(data.objects.map(obj => obj.package));
            } else {
                const data = await MarketplaceService.searchPlugins(searchQuery);
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (plugin: any, isNpm: boolean = false) => {
        setInstallingId(plugin.id || plugin.name);
        // Simulate installation delay
        await new Promise(r => setTimeout(r, 1500));

        const pluginData = isNpm ? {
            id: `npm-${plugin.name}`,
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            type: 'logic',
            source: 'npm',
            esmUrl: NpmService.getEsmUrl(plugin.name, plugin.version)
        } : plugin;

        installPlugin(pluginData);
        setInstallingId(null);
    };

    const isInstalled = (id: string) => {
        return state.installedPlugins.some((p: any) => p.id === id || p.id === `npm-${id}`);
    };

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl font-sans">
            <div className="w-full max-w-5xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 blur-[100px] -z-10" />

                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Package className="w-6 h-6 text-white/80" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                PLUGIN MARKETPLACE
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40 font-bold uppercase tracking-widest">v2.0</span>
                            </h2>
                            <p className="text-sm text-white/40 font-medium">Extend OMNIOS with official plugins or the entire NPM ecosystem.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all active:scale-95">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="px-8 flex items-center justify-between gap-8 mb-6 mt-4">
                    <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl gap-1">
                        {[
                            { id: 'featured', label: 'Featured', icon: Sparkles },
                            { id: 'npm', label: 'NPM Bridge', icon: Globe },
                            { id: 'installed', label: 'Installed', icon: Check }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'npm' ? "Search 2M+ NPM packages..." : "Search official plugins..."}
                            className="w-full h-11 bg-white/5 border border-white/10 group-focus-within:border-teal-500/50 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                        />
                    </form>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
                            <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                            <p className="text-sm font-black uppercase tracking-widest">Summoning Packages...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTab === 'installed' ? (
                                state.installedPlugins.length > 0 ? (
                                    state.installedPlugins.map((plugin: any) => (
                                        <PluginCard
                                            key={plugin.id}
                                            plugin={plugin}
                                            onUninstall={() => uninstallPlugin(plugin.id)}
                                            isInstalled={true}
                                        />
                                    ))
                                ) : (
                                    <EmptyState message="No plugins installed yet." icon={Package} />
                                )
                            ) : activeTab === 'npm' ? (
                                npmResults.map((pkg, i) => (
                                    <NpmPackageCard
                                        key={i}
                                        pkg={pkg}
                                        onInstall={() => handleInstall(pkg, true)}
                                        isInstalling={installingId === pkg.name}
                                        isInstalled={isInstalled(pkg.name)}
                                    />
                                ))
                            ) : (
                                results.map((plugin) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onInstall={() => handleInstall(plugin)}
                                        isInstalling={installingId === plugin.id}
                                        isInstalled={isInstalled(plugin.id)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PluginCard = ({ plugin, onInstall, onUninstall, isInstalling, isInstalled }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col gap-4 group">
        <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Package className="w-6 h-6 text-white/60" />
            </div>
            {isInstalled ? (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE
                    </span>
                    {onUninstall && (
                        <button onClick={onUninstall} className="text-white/20 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <Button
                    onClick={onInstall}
                    disabled={isInstalling}
                    className="h-8 bg-white hover:bg-white/90 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                >
                    {isInstalling ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                    Install
                </Button>
            )}
        </div>
        <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{plugin.name}</h3>
            <p className="text-xs text-white/40 font-medium leading-relaxed line-clamp-2">{plugin.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest pt-4 border-t border-white/5">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-teal-400" /> {plugin.downloads || '0'}</span>
            <span>v{plugin.version}</span>
        </div>
    </div>
);

const NpmPackageCard = ({ pkg, onInstall, isInstalling, isInstalled }: any) => (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Globe className="w-8 h-8 text-white/10" />
        </div>
        <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                    <Package className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">NPM Package</span>
                    <h3 className="text-sm font-black text-white tracking-tight leading-none">{pkg.name}</h3>
                </div>
            </div>
        </div>

        <p className="text-xs text-white/40 font-medium leading-relaxed line-clamp-3">{pkg.description}</p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">v{pkg.version}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">@{pkg.publisher.username}</span>
            </div>
            {isInstalled ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 flex items-center gap-1 bg-teal-500/10 px-2 py-1 rounded-lg">
                    <Check className="w-3 h-3" /> INSTALLED
                </span>
            ) : (
                <Button
                    onClick={onInstall}
                    disabled={isInstalling}
                    className="h-8 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 px-4"
                >
                    {isInstalling ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2 text-rose-400" />}
                    Add to Logic
                </Button>
            )}
        </div>
    </div>
);

const EmptyState = ({ message, icon: Icon }: any) => (
    <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 text-white/10">
        <Icon className="w-16 h-16" />
        <p className="text-sm font-black uppercase tracking-widest">{message}</p>
    </div>
);
