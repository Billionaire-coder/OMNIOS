
import { pluginManager } from './PluginManager';
import { PluginContext, OMNIOSPlugin } from '@/types/plugins';

// Client-side facade for PluginManager
export class PluginHost {
    init(context: PluginContext) {
        pluginManager.setContext(context);
    }

    registerPlugin(plugin: OMNIOSPlugin) {
        pluginManager.registerPlugin(plugin);
    }

    getPlugins() {
        return pluginManager.getPlugins();
    }
}

export const pluginHost = new PluginHost();
