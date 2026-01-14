
export interface NpmPackageMetadata {
    name: string;
    version: string;
    description: string;
    author?: string | { name: string };
    license?: string;
    homepage?: string;
    dependencies?: Record<string, string>;
    dist?: {
        shasum: string;
        tarball: string;
    };
}

export interface NpmSearchResult {
    objects: Array<{
        package: {
            name: string;
            version: string;
            description: string;
            keywords?: string[];
            publisher: {
                username: string;
            };
        };
    }>;
}

export class NpmService {
    private static REGISTRY_BASE = 'https://registry.npmjs.org';
    private static SEARCH_BASE = 'https://registry.npmjs.org/-/v1/search';

    static async search(query: string, limit: number = 20): Promise<NpmSearchResult> {
        const response = await fetch(`${this.SEARCH_BASE}?text=${encodeURIComponent(query)}&size=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to search NPM: ${response.statusText}`);
        }
        return response.json();
    }

    static async getPackage(name: string): Promise<NpmPackageMetadata> {
        const response = await fetch(`${this.REGISTRY_BASE}/${name}/latest`);
        if (!response.ok) {
            throw new Error(`Failed to fetch package ${name}: ${response.statusText}`);
        }
        return response.json();
    }

    static async getVersions(name: string): Promise<string[]> {
        const response = await fetch(`${this.REGISTRY_BASE}/${name}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch versions for ${name}: ${response.statusText}`);
        }
        const data = await response.json();
        return Object.keys(data.versions);
    }

    /**
     * Estimates if a package is "OMNIOS-Friendly" (e.g., has browser-side logic)
     */
    static isOmniosFriendly(pkg: NpmPackageMetadata): boolean {
        // Simple heuristic for MVP: if it doesn't have heavy node-specific deps or if it's explicitly frontend
        const keywords = (pkg as any).keywords || [];
        const isClientOnly = keywords.includes('react') || keywords.includes('browser') || keywords.includes('ui');
        return isClientOnly || !pkg.dependencies?.['fs'];
    }

    /**
     * Generates an ESM.sh URL for a package
     */
    static getEsmUrl(name: string, version: string = 'latest'): string {
        return `https://esm.sh/${name}@${version}`;
    }
}
