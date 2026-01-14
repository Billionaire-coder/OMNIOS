
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { PluginHost } from './ServerPluginHost';

// Mock fetch globally
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('PluginHost', () => {

    it('should execute basic code', async () => {
        const host = new PluginHost();
        const code = 'result = 1 + 1;';
        const result = await host.execute(code, { inputs: {}, secrets: {} });
        expect(result).toBe(2);
    });

    it('should inject inputs correctly', async () => {
        const host = new PluginHost();
        const code = 'result = inputs.name;';
        const result = await host.execute(code, {
            inputs: { name: 'OMNIOS' },
            secrets: {}
        });
        expect(result).toBe('OMNIOS');
    });

    it('should block network access by default', async () => {
        const host = new PluginHost({ network: false });
        const code = `await fetch('https://google.com')`;

        await expect(host.execute(code, { inputs: {}, secrets: {} }))
            .rejects
            .toThrow('Network access is disabled');
    });

    it('should block access to process global', async () => {
        const host = new PluginHost();
        const code = `
            try {
                result = process.env;
            } catch(e) {
                result = 'BLOCKED';
            }
        `;
        // "process is not defined" error expected inside VM
        await host.execute(code, { inputs: {}, secrets: {} });
        // The VM wrapper catches and throws, or in this case result is undefined because process is undefined
        // Actually, accessing undefined variable throws ReferenceError
        // Our test code catches it and sets result to BLOCKED
        const result = await host.execute(code, { inputs: {}, secrets: {} });
        expect(result).toBe('BLOCKED');
    });
});
