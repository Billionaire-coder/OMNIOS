
import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Rocket, Shield, Globe, CheckCircle, XCircle, Loader2, ChevronRight, HardDrive, Github, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { deployService, DeployTarget, DeployResult } from '@/lib/deployment/DeployService';
import { GitHubService } from '@/lib/deployment/GitHubService';


export const DeploymentPanel: React.FC = ({ onClose }: { onClose?: () => void }) => {
    const { state } = useProjectStore();
    const [token, setToken] = useState(state.deployment.token || ''); // TODO: Persist this securely
    const [target, setTarget] = useState<DeployTarget>('netlify');
    const [isDeploying, setIsDeploying] = useState(false);
    const [result, setResult] = useState<DeployResult | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Filter for deployment-specific logs from debugLogs
    const deploymentLogs = result?.logs || [];

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [deploymentLogs, result]);

    const handleDeploy = async () => {
        if (!token) return;
        setIsDeploying(true);
        setResult(null);

        try {
            let deployResult;
            if (target === 'github') {
                // GitHub Flow
                const repoName = state.name.toLowerCase().replace(/\s+/g, '-');
                // 1. Create Repo (if not caching ID in store yet, just try create or assume exists)
                // For MVP, we'll try to create, if fails (exists), we push to it.
                // In production, we'd check `state.gitConfig`.
                let repo;
                try {
                    repo = await GitHubService.createRepo(token, repoName);
                } catch (e) {
                    // Assume it exists or we don't have permission to create, try pushing to user/repoName
                    // We need the owner name, which we can get from a utility or assume user knows
                    // For now, let's just log and try to construct the object
                    //Ideally, we should get the authenticated user first.
                    const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}` } });
                    const user = await userRes.json();
                    repo = { owner: user.login, name: repoName };
                }

                await GitHubService.pushChanges(token, repo as any, state, "Update from OMNIOS");
                deployResult = {
                    success: true,
                    logs: ["Repo synced", "Commit pushed to main"],
                    deploymentUrl: `https://github.com/${repo!.owner}/${repo!.name}`
                };
            } else {
                // Vercel / Netlify
                deployResult = await deployService.deploy(target, state, token);
            }
            setResult(deployResult);
        } catch (err: any) {
            setResult({ success: false, logs: [], error: err.message || 'An unexpected error occurred' });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="fixed top-20 right-8 w-96 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Rocket className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            The Publisher
                        </h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Broadcast to the World</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {!result ? (
                    <Tabs defaultValue="netlify" onValueChange={(v: string) => setTarget(v as DeployTarget)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 mb-4">
                            <TabsTrigger value="netlify">Netlify</TabsTrigger>
                            <TabsTrigger value="vercel">Vercel</TabsTrigger>
                            <TabsTrigger value="github">GitHub</TabsTrigger>
                        </TabsList>

                        <TabsContent value="netlify" className="mt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Netlify Access Token
                                    </label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Enter Netlify Token"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs"
                                    />
                                    <p className="text-[10px] text-white/30">
                                        Found in Netlify User Settings &gt; Applications &gt; Personal Access Tokens
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vercel" className="mt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Vercel Token
                                    </label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Enter Vercel Token"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs"
                                    />
                                    <p className="text-[10px] text-white/30">
                                        Found in Vercel Account Settings &gt; Tokens
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="github" className="mt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                                        <Github className="w-4 h-4" /> GitHub PAT
                                    </label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Enter GitHub PAT"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs"
                                    />
                                    <p className="text-[10px] text-white/30">
                                        Requires <code>repo</code> scope.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                    </Tabs>
                ) : (
                    <div className="space-y-4">
                        {/* Result View */}
                        {result.success ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <CheckCircle className="w-4 h-4" /> DEPLOYMENT SUCCESSFUL
                                </div>
                                {result.deploymentUrl && (
                                    <a
                                        href={result.deploymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1 block truncate"
                                    >
                                        <Globe className="w-3 h-3" /> {result.deploymentUrl} <ChevronRight className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-shake">
                                <XCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-sm font-medium text-rose-300">{result.error}</span>
                            </div>
                        )}

                        {/* Logs */}
                        <div className="bg-black/60 rounded-xl border border-white/5 p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {result.logs.map((log, i) => (
                                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-white/70">
                                        {log}
                                    </span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5"
                            onClick={() => setResult(null)}
                        >
                            Back to Settings
                        </Button>
                    </div>
                )}

                {/* Footer Action */}
                {!result && (
                    <Button
                        onClick={handleDeploy}
                        disabled={isDeploying || !token}
                        className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isDeploying ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                BROADCASTING...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Rocket className="w-5 h-5" />
                                DEPLOY TO {target.toUpperCase()}
                            </div>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};
