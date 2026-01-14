"use client";

import React, { useState } from 'react';
import { BuildOrchestrator, BuildStatus } from '@/lib/native/buildOrchestrator';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone, Package, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export function NativeBuildTool() {
    const [builds, setBuilds] = useState<Record<string, any>>({});
    const [isTriggering, setIsTriggering] = useState(false);

    const startBuild = async (platform: 'ios' | 'android') => {
        setIsTriggering(true);
        await BuildOrchestrator.startBuild(platform, (update) => {
            setBuilds(prev => ({
                ...prev,
                [update.id]: update
            }));
            if (update.status === 'finished' || update.status === 'failed') {
                setIsTriggering(false);
            }
        });
    };

    return (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-medium">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Native Build Forge</span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
                Export your project as a standalone mobile application. OMNIOS will bundle your design into a native binary via EAS Cloud.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    onClick={() => startBuild('ios')}
                    disabled={isTriggering}
                    className="flex flex-col gap-2 h-auto py-4 bg-white/5 border-zinc-800 hover:bg-white/10 text-zinc-300"
                    variant="outline"
                >
                    <Apple className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Build iOS</span>
                </Button>

                <Button
                    onClick={() => startBuild('android')}
                    disabled={isTriggering}
                    className="flex flex-col gap-2 h-auto py-4 bg-white/5 border-zinc-800 hover:bg-white/10 text-zinc-300"
                    variant="outline"
                >
                    <Smartphone className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Build Android</span>
                </Button>
            </div>

            {Object.values(builds).length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                    {Object.values(builds).map((build) => (
                        <div key={build.id} className="p-3 bg-zinc-950 rounded border border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    {build.platform === 'ios' ? <Apple className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                    <span className="text-[11px] font-bold text-zinc-200">Build #{build.id}</span>
                                </div>
                                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${build.status === 'finished' ? 'bg-green-500/10 text-green-500' :
                                        build.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                            'bg-purple-500/10 text-purple-500 animate-pulse'
                                    }`}>
                                    {build.status}
                                </span>
                            </div>

                            {build.status === 'building' && (
                                <div className="space-y-1">
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 transition-all duration-500"
                                            style={{ width: `${build.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-zinc-600 block text-right">{build.progress}%</span>
                                </div>
                            )}

                            {build.status === 'finished' && (
                                <a
                                    href={build.downloadUrl}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-green-500/10 text-green-500 text-[11px] font-bold rounded hover:bg-green-500/20 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Download Artifact
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
