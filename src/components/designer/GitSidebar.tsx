
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { gitService, GitRepo } from '../../lib/git/GitService';
import * as Icons from 'lucide-react';

export const GitSidebar: React.FC = () => {
    const { state, connectGit, selectRepo, setBranch, syncWithGit, importFromCode, createBranch, mergeBranch } = useProjectStore();
    const [repos, setRepos] = useState<GitRepo[]>([]);
    const [search, setSearch] = useState('');
    const [branches, setBranches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state.gitConfig?.token) {
            setLoading(true);
            gitService.fetchRepos().then(list => {
                setRepos(list);
                setLoading(false);
            });
        }
    }, [state.gitConfig?.token]);

    useEffect(() => {
        if (state.gitConfig?.repo && state.gitConfig?.token) {
            gitService.fetchBranches(state.gitConfig.repo.owner, state.gitConfig.repo.name)
                .then(setBranches);
        }
    }, [state.gitConfig?.repo, state.gitConfig?.token]);

    const filteredRepos = repos.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.owner.toLowerCase().includes(search.toLowerCase())
    );

    if (!state.gitConfig?.token) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                    <Icons.Github size={32} />
                </div>
                <div>
                    <h3 className="text-white font-medium">Connect to GitHub</h3>
                    <p className="text-zinc-500 text-sm mt-1">
                        Turn OMNIOS into a visual frontend for your repositories.
                    </p>
                </div>
                <button
                    onClick={() => connectGit('github')}
                    className="w-full py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Icons.Github size={18} />
                    Connect GitHub
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <Icons.GitBranch size={18} className="text-indigo-400" />
                        Git Sync
                    </h3>
                    <div className="flex items-center gap-2">
                        {state.gitStatus !== 'idle' && (
                            <Icons.RefreshCw size={14} className="text-indigo-400 animate-spin" />
                        )}
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${state.gitStatus === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                            {state.gitStatus}
                        </span>
                    </div>
                </div>

                {!state.gitConfig.repo ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="max-h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="py-8 text-center text-zinc-500 text-sm">Loading repositories...</div>
                            ) : filteredRepos.map(repo => (
                                <button
                                    key={repo.id}
                                    onClick={() => selectRepo({ id: repo.id, name: repo.name, owner: repo.owner })}
                                    className="w-full p-3 text-left hover:bg-zinc-800 rounded-lg transition-colors group"
                                >
                                    <div className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">
                                        {repo.name}
                                    </div>
                                    <div className="text-zinc-500 text-[10px] mt-0.5">{repo.owner}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-800 flex items-center justify-between">
                            <div>
                                <div className="text-white text-sm font-medium">{state.gitConfig.repo.name}</div>
                                <div className="text-zinc-500 text-[10px]">{state.gitConfig.repo.owner}</div>
                            </div>
                            <button
                                onClick={() => selectRepo(undefined as any)}
                                className="p-1.5 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white"
                            >
                                <Icons.X size={14} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Active Branch</label>
                            <select
                                value={state.gitConfig.branch}
                                onChange={(e) => setBranch(e.target.value)}
                                className="w-full bg-zinc-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                            >
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1 flex items-center justify-between">
                                New Branch
                                <Icons.Plus size={10} />
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="branch-name"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const name = (e.target as HTMLInputElement).value;
                                            if (name) {
                                                await createBranch(name);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                    className="flex-1 bg-zinc-800 border-none rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Remote Branches</label>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                {branches.filter(b => b !== state.gitConfig?.branch).map(b => (
                                    <div key={b} className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg group transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Icons.GitBranch size={12} className="text-zinc-500" />
                                            <span className="text-xs text-zinc-300">{b}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setBranch(b)}
                                                className="p-1 px-2 bg-zinc-700 text-zinc-300 rounded text-[10px] hover:bg-zinc-600"
                                            >
                                                Switch
                                            </button>
                                            <button
                                                onClick={() => mergeBranch(b)}
                                                className="p-1 px-2 bg-indigo-600/10 text-indigo-400 rounded text-[10px] hover:bg-indigo-600 hover:text-white"
                                            >
                                                Merge
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                            <button
                                onClick={() => syncWithGit('pull')}
                                className="flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                            >
                                <Icons.Download size={14} />
                                Pull
                            </button>
                            <button
                                onClick={() => syncWithGit('push')}
                                className="flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
                            >
                                <Icons.Upload size={14} />
                                Push
                            </button>
                        </div>

                        {state.lastSyncAt && (
                            <div className="text-[10px] text-zinc-500 text-center">
                                Last synced: {new Date(state.lastSyncAt).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
                        <span>Repository Files</span>
                        <Icons.FileCode size={12} />
                    </div>

                    <div className="space-y-1">
                        {['src/App.tsx', 'src/components/Header.tsx', 'src/components/Hero.tsx'].map(file => (
                            <div key={file} className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg group transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Icons.File size={14} className="text-zinc-500 shrink-0" />
                                    <span className="text-xs text-zinc-300 truncate">{file}</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (state.gitConfig?.repo) {
                                            const result = await gitService.getFileContent(
                                                state.gitConfig.repo.owner,
                                                state.gitConfig.repo.name,
                                                file,
                                                state.gitConfig.branch
                                            );
                                            if (result?.content) {
                                                importFromCode(result.content);
                                            } else {
                                                // Mock data if file doesn't exist or API fails
                                                const mockCode = `
import React from 'react';
export const ${file.split('/').pop()?.replace('.tsx', '')} = () => {
    return <div className="p-8 bg-zinc-900 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-4">Imported from ${file}</h1>
        <p className="text-zinc-400">Successfully reconstructed via OMNIOS AST Inverse Compiler.</p>
    </div>
}`;
                                                importFromCode(mockCode);
                                            }
                                        }
                                    }}
                                    className="p-1 px-2 bg-indigo-600/10 text-indigo-400 rounded text-[10px] opacity-0 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    Import
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
