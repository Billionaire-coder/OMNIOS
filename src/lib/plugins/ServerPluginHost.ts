
import vm from 'vm';
import { AppError } from '../error/AppError';

export interface PluginPermissions {
    network?: boolean;
    allowedDomains?: string[];
    env?: string[]; // Allowed env var names
}

export interface PluginContext {
    inputs: Record<string, any>;
    secrets: Record<string, string>;
}

export class PluginHost {
    private sandbox: any;
    private options: PluginPermissions;

    constructor(permissions: PluginPermissions = {}) {
        this.options = permissions;
    }

    private createSecureFetch() {
        if (!this.options.network) {
            return () => Promise.reject(new AppError('Network access is disabled for this plugin.', 'FORBIDDEN', 403));
        }

        const allowed = this.options.allowedDomains || [];

        return async (url: string, init?: RequestInit) => {
            const domain = new URL(url).hostname;

            // If allowedDomains is empty, ALL domains are blocked (default deny)
            // If allowedDomains has '*', allow all.
            const isAllowed = allowed.includes('*') || allowed.some(d => domain.endsWith(d));

            if (!isAllowed) {
                throw new AppError(`Network access to ${domain} is improperly configured or blocked.`, 'FORBIDDEN', 403);
            }

            return fetch(url, init);
        };
    }

    public async execute(code: string, context: PluginContext, timeoutMs = 5000): Promise<any> {
        const secureFetch = this.createSecureFetch();

        // Whitelist globals
        this.sandbox = {
            console: {
                log: (...args: any[]) => console.log('[Plugin]', ...args),
                error: (...args: any[]) => console.error('[Plugin]', ...args),
                warn: (...args: any[]) => console.warn('[Plugin]', ...args),
            },
            fetch: secureFetch,
            setTimeout,
            clearTimeout,
            URL,
            JSON,
            // Inject strictly controlled inputs and secrets
            inputs: context.inputs,
            env: context.secrets, // Only passed-in secrets, NOT process.env
            result: undefined, // Output slot
        };

        const vmContext = vm.createContext(this.sandbox);

        const script = new vm.Script(`
            (async () => {
                try {
                    ${code}
                } catch (e) {
                    throw e;
                }
            })()
        `);

        try {
            await script.runInContext(vmContext, {
                timeout: timeoutMs,
                displayErrors: true
            });

            return this.sandbox.result;
        } catch (error: any) {
            throw new AppError(`Plugin Execution Failed: ${error.message}`, 'INTERNAL_ERROR', 500);
        }
    }
}

export const pluginHost = new PluginHost();
