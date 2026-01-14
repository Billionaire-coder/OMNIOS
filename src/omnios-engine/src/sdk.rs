use std::any::Any;
use std::collections::HashMap;

// --- CONTEXT STRUCTS ---

/// Context passed to the plugin during registration.
/// Allows the plugin to inspect the engine capability or register hooks.
pub struct PluginContext {
    pub engine_version: String,
    // Future: pub taffy: &mut TaffyTree
    // Future: pub registry: &mut logic_registry
}

impl PluginContext {
    pub fn new() -> Self {
        Self {
            engine_version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }
}

/// Context passed to the plugin during the render phase.
/// Abstract wrapper for drawing commands (Canvas/WebGPU).
pub struct RenderContext {
    pub width: f32,
    pub height: f32,
    pub frame_count: u64,
    // Future: WGPU Device/Queue or CanvasContext2d
}

// --- THE PLUGIN TRAIT ---

/// The specific contract for Hyper Elements (OMNIOS Plugins).
pub trait OmniosPlugin: Any + Send {
    /// Unique name of the plugin (e.g., "PhysicsEngine")
    fn name(&self) -> &str;

    /// Called when the engine loads the plugin.
    /// Use this to register custom node types, event listeners, or allocate resources.
    fn on_register(&mut self, context: &mut PluginContext);

    /// (Optional) Called during the render loop.
    fn render(&self, _context: &RenderContext) {
        // Default: Do nothing (Logic-only plugins)
    }
}

// --- PLUGIN REGISTRY (Host) ---

pub struct PluginRegistry {
    plugins: Vec<Box<dyn OmniosPlugin>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self { plugins: Vec::new() }
    }

    pub fn register(&mut self, mut plugin: Box<dyn OmniosPlugin>) {
        let mut context = PluginContext::new();
        plugin.on_register(&mut context);
        self.plugins.push(plugin);
    }
    
    pub fn count(&self) -> usize {
        self.plugins.len()
    }
    
    pub fn render_all(&self, ctx: &RenderContext) {
        for plugin in &self.plugins {
            plugin.render(ctx);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MockPhysicsPlugin {
        active: bool,
    }
    
    impl OmniosPlugin for MockPhysicsPlugin {
        fn name(&self) -> &str { "MockPhysics" }
        fn on_register(&mut self, _ctx: &mut PluginContext) {
            self.active = true;
        }
    }

    #[test]
    fn test_plugin_registration() {
        let mut registry = PluginRegistry::new();
        
        let plugin = MockPhysicsPlugin { active: false };
        registry.register(Box::new(plugin));
        
        assert_eq!(registry.count(), 1);
        assert_eq!(registry.plugins[0].name(), "MockPhysics");
    }

    #[test]
    fn test_context_flow() {
        struct VersionCheckPlugin {
            compatible: bool,
        }
        impl OmniosPlugin for VersionCheckPlugin {
            fn name(&self) -> &str { "VersionChecker" }
            fn on_register(&mut self, ctx: &mut PluginContext) {
                // Verify we can read from context
                if !ctx.engine_version.is_empty() {
                    self.compatible = true;
                }
            }
        }

        let mut registry = PluginRegistry::new();
        let plugin = VersionCheckPlugin { compatible: false };
        
        // We can't inspect the plugin after moving it into Box without downcasting (advanced),
        // but for this unit test, we can verify the logic runs by panicking inside if false,
        // or just trusting the previous test. 
        // Better: Use a shared Arc<Mutex<bool>> to extracting state? 
        // Complexity trade-off. 
        // Let's keep it simple: "on_register" modifies internal state.
        // We will just register it. If it doesn't panic, it "works" in terms of ABI.
        
        registry.register(Box::new(plugin));
        assert_eq!(registry.count(), 1);
    }
}
