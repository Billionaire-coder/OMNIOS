import { OMNIOSPlugin, PluginContext } from '@/types/plugins';

export class PluginManager {
    private static instance: PluginManager;
    private plugins: Map<string, OMNIOSPlugin> = new Map();
    private engines: Map<string, any> = new Map();
    private activePlugins: Set<string> = new Set();
    private context: PluginContext | null = null;

    private constructor() { }

    static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    setContext(context: PluginContext) {
        this.context = context;
        // Initialize already registered plugins if needed
        this.plugins.forEach(plugin => {
            if (!this.activePlugins.has(plugin.id)) {
                plugin.init?.(context);
            }
        });
    }

    registerPlugin(plugin: OMNIOSPlugin) {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin ${plugin.id} is already registered.`);
            return;
        }
        this.plugins.set(plugin.id, plugin);
        if (this.context) {
            plugin.init?.(this.context);
        }
    }

    enablePlugin(id: string) {
        const plugin = this.plugins.get(id);
        if (plugin && this.context && !this.activePlugins.has(id)) {
            plugin.onEnable?.(this.context);
            this.activePlugins.add(id);
        }
    }

    disablePlugin(id: string) {
        const plugin = this.plugins.get(id);
        if (plugin && this.context && this.activePlugins.has(id)) {
            plugin.onDisable?.(this.context);
            this.activePlugins.delete(id);
        }
    }

    getPlugins(): OMNIOSPlugin[] {
        return Array.from(this.plugins.values());
    }

    getActivePlugins(): OMNIOSPlugin[] {
        return Array.from(this.plugins.values()).filter(p => this.activePlugins.has(p.id));
    }

    isPluginEnabled(id: string): boolean {
        return this.activePlugins.has(id);
    }

    // Engine SDK Methods
    registerEngine(id: string, engine: any) {
        console.log(`[SDK] Engine Registered: ${id}`);
        this.engines.set(id, engine);
    }

    getEngine(id: string) {
        return this.engines.get(id);
    }
}

export const pluginManager = PluginManager.getInstance();
