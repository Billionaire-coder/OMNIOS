use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::collections::{HashSet, HashMap};
use std::any::Any;
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use lazy_static::lazy_static;

// --- Plugin 1: InputPlugin (State Manager) ---
pub struct InputPlugin {
    pub pressed_keys: Arc<Mutex<HashSet<String>>>,
    pub cursor_x: f32,
    pub cursor_y: f32,
}

impl InputPlugin {
    pub fn new() -> Self {
        Self {
            pressed_keys: Arc::new(Mutex::new(HashSet::new())),
            cursor_x: 0.0,
            cursor_y: 0.0,
        }
    }
    
    // API to simulate browser events coming in
    pub fn on_key_down(&mut self, key: String) {
        self.pressed_keys.lock().unwrap().insert(key);
    }
    
    pub fn on_key_up(&mut self, key: &str) {
        self.pressed_keys.lock().unwrap().remove(key);
    }
}

impl OmniosPlugin for InputPlugin {
    fn name(&self) -> &str { "InputPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {
        // In real engine: subscribe to window.addEventListener
    }
}

// --- Dynamic Shortcut Registry (Batch 24.2) ---

lazy_static! {
    static ref SHORTCUT_REGISTRY: Mutex<ShortcutsPlugin> = Mutex::new(ShortcutsPlugin::new_with_defaults());
}

#[derive(Hash, Eq, PartialEq, Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutKey {
    pub key: String,
    pub ctrl: bool,
    pub shift: bool,
    pub alt: bool,
    pub meta: bool,
}

impl ShortcutKey {
    pub fn new(key: &str, ctrl: bool, shift: bool, alt: bool, meta: bool) -> Self {
        Self {
            key: key.to_lowercase(),
            ctrl,
            shift,
            alt,
            meta,
        }
    }
}

pub struct ShortcutsPlugin {
    registry: HashMap<ShortcutKey, String>, // Key -> Action Name (e.g., "Undo")
    input_ref: Option<Arc<Mutex<HashSet<String>>>>,
}

impl ShortcutsPlugin {
    pub fn new() -> Self {
        Self {
            registry: HashMap::new(),
            input_ref: None,
        }
    }

    pub fn new_with_defaults() -> Self {
        let mut plugin = Self::new();
        plugin.register_defaults();
        plugin
    }

    fn register(&mut self, key: &str, ctrl: bool, shift: bool, meta: bool, action: &str) {
        let k = ShortcutKey::new(key, ctrl, shift, false, meta);
        self.registry.insert(k, action.to_string());
    }

    pub fn register_defaults(&mut self) {
        // Mac (Meta) & Windows (Ctrl) support via simple double registration for MVP
        // In a real OS-aware engine, we'd check target_os or have an abstraction.
        
        let actions = [
            ("z", true, false, "Undo"),
            ("z", true, true, "Redo"), // Mac Redo usually Cmd+Shift+Z
            ("y", true, false, "Redo"), // Win Redo
            ("s", true, false, "Save"),
            ("c", true, false, "Copy"),
            ("v", true, false, "Paste"),
            ("x", true, false, "Cut"),
            ("a", true, false, "SelectAll"),
            ("d", true, false, "Duplicate"),
            ("g", true, false, "Group"),
            ("g", true, true, "Ungroup"),
            ("=", true, false, "ZoomIn"),
            ("-", true, false, "ZoomOut"),
            ("0", true, false, "ResetView"),
            ("k", true, false, "ToggleCommandBar"),
            (".", true, false, "ToggleUI"),
        ];

        for (key, cmd, shift, act) in actions {
            // Register for both Ctrl and Meta to cover Window/Mac in one go for WASM
            self.register(key, cmd, shift, false, act); // Windows/Linux (Ctrl)
            self.register(key, false, shift, true, act); // Mac (Meta/Cmd)
        }

        // Special keys
        self.register("delete", false, false, false, "Delete");
        self.register("backspace", false, false, false, "Delete");
        self.register("escape", false, false, false, "Escape");
    }

    pub fn resolve(&self, key: &str, ctrl: bool, shift: bool, alt: bool, meta: bool) -> Option<String> {
        let k = ShortcutKey::new(key, ctrl, shift, alt, meta);
        self.registry.get(&k).cloned()
    }

    pub fn remap(&mut self, action: &str, key: &str, ctrl: bool, shift: bool, alt: bool, meta: bool) {
        // Remove old binding for this action if we wanted unique 1:1, but many-to-one is fine.
        // We just verify we overwrite if the key binding existed for something else.
        let k = ShortcutKey::new(key, ctrl, shift, alt, meta);
        self.registry.insert(k, action.to_string());
    }
    
    pub fn link_input(&mut self, input: &InputPlugin) {
        self.input_ref = Some(input.pressed_keys.clone());
    }
}

impl OmniosPlugin for ShortcutsPlugin {
    fn name(&self) -> &str { "ShortcutsPlugin" }
    
    fn on_register(&mut self, _context: &mut PluginContext) {}

    fn render(&self, _ctx: &RenderContext) {
        // Active polling logic removed in favor of event-driven query via handle_key_event
        // But we could keep logic here for continuous inputs (like game WASD) if needed.
    }
}

// --- WASM Exports ---

#[wasm_bindgen]
pub fn handle_key_event(key: &str, ctrl: bool, shift: bool, alt: bool, meta: bool) -> Option<JsValue> {
    let registry = SHORTCUT_REGISTRY.lock().unwrap();
    if let Some(action_name) = registry.resolve(key, ctrl, shift, alt, meta) {
        // Return JsValue (String) directly
        serde_wasm_bindgen::to_value(&action_name).ok()
    } else {
        None
    }
}

#[wasm_bindgen]
pub fn remap_shortcut(action: &str, key: &str, ctrl: bool, shift: bool, alt: bool, meta: bool) {
    let mut registry = SHORTCUT_REGISTRY.lock().unwrap();
    registry.remap(action, key, ctrl, shift, alt, meta);
}
