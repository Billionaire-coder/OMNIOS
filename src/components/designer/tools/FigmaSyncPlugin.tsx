"use client";

import React, { useState } from 'react';
import { FigmaSyncService } from '@/lib/importers/figmaSyncService';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, RefreshCcw, StopCircle, Zap } from 'lucide-react';

export function FigmaSyncPlugin() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [fileKey, setFileKey] = useState('');
    const [token, setToken] = useState('');
    const { updateProjectState } = useProjectStore();

    const handleToggleSync = () => {
        if (isSyncing) {
            FigmaSyncService.stopLiveSync();
            setIsSyncing(false);
        } else {
            if (!fileKey || !token) {
                alert('Please enter a File Key and Personal Access Token');
                return;
            }
            setIsSyncing(true);
            FigmaSyncService.startLiveSync(fileKey, token, (updates) => {
                updateProjectState(updates);
            });
        }
    };

    return (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-medium">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Figma Live Sync</span>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Figma File Key</label>
                <div className="relative">
                    <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <Input
                        value={fileKey}
                        onChange={(e) => setFileKey(e.target.value)}
                        placeholder="e.g. ab12CD34..."
                        className="pl-10 bg-zinc-950 border-zinc-800 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Access Token</label>
                <Input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="figd_..."
                    className="bg-zinc-950 border-zinc-800 text-sm"
                />
            </div>

            <Button
                onClick={handleToggleSync}
                className={`w-full gap-2 ${isSyncing ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20' : 'bg-zinc-100 text-black hover:bg-white'}`}
                variant={isSyncing ? "outline" : "primary"}
            >
                {isSyncing ? (
                    <>
                        <StopCircle className="w-4 h-4" />
                        Stop Live Sync
                    </>
                ) : (
                    <>
                        <RefreshCcw className="w-4 h-4" />
                        Start Live Sync
                    </>
                )}
            </Button>

            {isSyncing && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 animate-pulse">
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    Waiting for Figma changes...
                </div>
            )}
        </div>
    );
}
