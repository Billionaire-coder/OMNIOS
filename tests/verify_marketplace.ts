import { pluginHost } from '@/lib/plugins/PluginHost';
import { PluginContext } from '@/types/plugins';

// Mock registry if needed (or keep legacy import if it exists)
import { marketplaceRegistry } from '../src/lib/marketplace/registry';

async function runTest() {
    console.log("Starting Marketplace & Plugin SDK Verification...");

    // 1. Init Host
    const mockContext: any = { // Use any to bypass strict checks for now as this is a verification script
        projectId: 'test',
        projectName: 'Test',
        store: { state: {} },
        // ... add missing props or just use cast
    };
    pluginHost.init(mockContext);
    console.log("- PluginHost initialized");

    // 2. Fetch from Marketplace
    console.log("- Fetching plugins from registry...");
    const plugins = await marketplaceRegistry.fetchItems('plugin');
    const estimator = plugins.find((p: any) => p.id === 'ai-property-estimator');

    if (estimator) {
        console.log(`✅ Found Plugin: ${estimator.name}`);

        // 3. Simulate Installation (Manually call what MarketplacePanel does)
        console.log("- Simulating installation...");
        const { PropertyEstimatorPlugin } = await import('../src/lib/plugins/samples/PropertyEstimator');
        pluginHost.registerPlugin(PropertyEstimatorPlugin);

        const activePlugins = pluginHost.getPlugins();
        if (activePlugins.some((p: any) => p.id === 'ai-property-estimator')) {
            console.log("✅ Plugin is active in Host!");
        } else {
            throw new Error("Plugin failed to activate");
        }
    } else {
        throw new Error("AI Property Estimator not found in registry");
    }

    console.log("\n✅ Phase 9 Verification PASSED!");
}

runTest().catch(e => {
    console.error("❌ Verification FAILED:", e);
    process.exit(1);
});
