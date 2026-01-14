
export interface GitRepo {
    id: string;
    name: string;
    owner: string;
    description: string;
    url: string;
}

export class GitService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
    }

    async fetchRepos(): Promise<GitRepo[]> {
        if (!this.token) return [];

        try {
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch repos');

            const data = await response.json();
            return data.map((repo: any) => ({
                id: repo.id.toString(),
                name: repo.name,
                owner: repo.owner.login,
                description: repo.description,
                url: repo.html_url
            }));
        } catch (error) {
            console.error('GitService Error:', error);
            return [];
        }
    }

    async fetchBranches(owner: string, repo: string): Promise<string[]> {
        if (!this.token) return [];

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch branches');

            const data = await response.json();
            return data.map((branch: any) => branch.name);
        } catch (error) {
            console.error('GitService Error:', error);
            return [];
        }
    }

    async getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<{ content: string, sha: string } | null> {
        if (!this.token) return null;

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (data.encoding === 'base64') {
                return {
                    content: atob(data.content),
                    sha: data.sha
                };
            }
            return null;
        } catch (error) {
            console.error('GitService Error:', error);
            return null;
        }
    }

    async updateFileContent(owner: string, repo: string, path: string, content: string, message: string, branch: string = 'main'): Promise<boolean> {
        if (!this.token) return false;

        try {
            // 1. Get existing file to get SHA (required for update)
            const existing = await this.getFileContent(owner, repo, path, branch);
            const sha = existing?.sha;

            // 2. Update File
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    content: btoa(content),
                    sha,
                    branch
                })
            });

            return response.ok;
        } catch (error) {
            console.error('GitService Commit Error:', error);
            return false;
        }
    }

    async createBranch(owner: string, repo: string, name: string, source: string = 'main'): Promise<boolean> {
        if (!this.token) return false;

        try {
            // 1. Get SHA of source branch
            const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${source}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!refRes.ok) return false;
            const refData = await refRes.json();
            const sha = refData.object.sha;

            // 2. Create new branch
            const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: `refs/heads/${name}`,
                    sha
                })
            });

            return createRes.ok;
        } catch (error) {
            console.error('GitService Create Branch Error:', error);
            return false;
        }
    }

    async mergeBranches(owner: string, repo: string, base: string, head: string, message: string = 'Merge branch'): Promise<{ success: boolean, conflict?: boolean, error?: string }> {
        if (!this.token) return { success: false, error: 'No token' };

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/merges`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base,
                    head,
                    commit_message: message
                })
            });

            if (response.status === 201 || response.status === 204) {
                return { success: true };
            } else if (response.status === 409) {
                return { success: false, conflict: true, error: 'Merge conflict' };
            } else {
                const err = await response.json();
                return { success: false, error: err.message };
            }
        } catch (error: any) {
            console.error('GitService Merge Error:', error);
            return { success: false, error: error.message };
        }
    }
}

export const gitService = new GitService();
