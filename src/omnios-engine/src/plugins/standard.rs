use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use wasm_bindgen::prelude::*;
#[cfg(feature = "browser")]
use web_sys::console;

// --- GRAVITY PLUGIN (Layout Logic) ---

pub struct GravityPlugin;

impl OmniosPlugin for GravityPlugin {
    fn name(&self) -> &str {
        "OmniosGravity"
    }

    fn on_register(&mut self, _ctx: &mut PluginContext) {
        // In a real engine, we would register a LayoutSystem hook here.
        // For now, we log initialization.
        #[cfg(feature = "browser")]
        console::log_1(&"Gravity System Initialized".into());
    }
}

// --- SNOW PLUGIN (Render Logic) ---

pub struct SnowPlugin {
    particle_count: usize,
}

impl SnowPlugin {
    pub fn new() -> Self {
        Self { particle_count: 100 }
    }
}

impl OmniosPlugin for SnowPlugin {
    fn name(&self) -> &str {
        "OmniosSnow"
    }

    fn on_register(&mut self, _ctx: &mut PluginContext) {
        #[cfg(feature = "browser")]
        console::log_1(&format!("Snow System Initialized with {} particles", self.particle_count).into());
    }

    fn render(&self, ctx: &RenderContext) {
        // Simulate rendering logic
        // We use frame_count to show "animation" awareness
        if ctx.frame_count % 60 == 0 {
             #[cfg(feature = "browser")]
             console::log_1(&format!("Rendering Snow frame: {}", ctx.frame_count).into());
        }
    }
}

pub fn create_gravity_plugin() -> Box<dyn OmniosPlugin> {
    Box::new(GravityPlugin)
}

pub fn create_snow_plugin() -> Box<dyn OmniosPlugin> {
    Box::new(SnowPlugin::new())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sdk::PluginRegistry;

    #[test]
    fn test_standard_plugins() {
        let mut registry = PluginRegistry::new();
        
        registry.register(create_gravity_plugin());
        registry.register(create_snow_plugin());
        
        assert_eq!(registry.count(), 2);
        assert_eq!(registry.plugins[0].name(), "OmniosGravity");
        assert_eq!(registry.plugins[1].name(), "OmniosSnow");
    }
}
