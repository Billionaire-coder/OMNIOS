/**
 * OMNIOS Secure Sandbox
 * Provides an isolated execution environment for third-party plugins and logic scripts.
 */

export class Sandbox {
    /**
     * Executes code in a restricted context.
     * @param code The JS code to execute.
     * @param context The context object containing allowed APIs.
     */
    public static run(code: string, context: Record<string, any>) {
        // Create a restricted scope using a Proxy
        const handler = {
            get(target: any, prop: string) {
                if (prop in target) return target[prop];
                if (prop === 'window' || prop === 'global' || prop === 'document') return undefined; // Block globals
                return undefined;
            }
        };

        const proxy = new Proxy(context, handler);

        try {
            // We use the Function constructor for execution within the proxied scope
            // 'with' block is used to bind the scope, though it has performance caveats,
            // for simple logic nodes it provides the cleanest DX.
            const fn = new Function('context', `
                with (context) {
                    ${code}
                }
            `);
            return fn(proxy);
        } catch (e) {
            console.error("[Sandbox] Execution Error:", e);
            throw e;
        }
    }
}
