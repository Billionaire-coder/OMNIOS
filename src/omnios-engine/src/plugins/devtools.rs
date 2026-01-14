use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::sync::{Arc, Mutex};
use std::time::{Instant, Duration};

// --- Plugin 1: ProfilerPlugin (Performance Monitor) ---
pub struct ProfilerPlugin {
    pub last_frame: Mutex<Instant>,
    pub frame_count: Mutex<u64>,
    pub fps: Mutex<f32>,
}

impl ProfilerPlugin {
    pub fn new() -> Self {
        Self {
            last_frame: Mutex::new(Instant::now()),
            frame_count: Mutex::new(0),
            fps: Mutex::new(0.0),
        }
    }
    
    pub fn start_frame(&self) {
        // In a real WASM env, Instant::now() works differently, 
        // but for logic verification this structure holds.
        let mut last = self.last_frame.lock().unwrap();
        let now = Instant::now();
        let duration = now.duration_since(*last);
        
        if duration.as_secs_f32() > 1.0 {
            let count = *self.frame_count.lock().unwrap();
            *self.fps.lock().unwrap() = count as f32 / duration.as_secs_f32();
            *self.frame_count.lock().unwrap() = 0;
            *last = now;
        }
    }
    
    pub fn end_frame(&self) {
        *self.frame_count.lock().unwrap() += 1;
    }
}

impl OmniosPlugin for ProfilerPlugin {
    fn name(&self) -> &str { "ProfilerPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
    fn render(&self, _ctx: &RenderContext) {
        self.end_frame(); // Count this render pass
        self.start_frame(); // Reset if needed
    }
}

// --- Plugin 2: InspectorPlugin (Visual Debugger) ---
pub struct InspectorPlugin {
    pub enabled: Mutex<bool>,
    pub debug_rects: Mutex<Vec<(f32, f32, f32, f32)>>, // x, y, w, h
}

impl InspectorPlugin {
    pub fn new() -> Self {
        Self { 
            enabled: Mutex::new(true),
            debug_rects: Mutex::new(Vec::new()),
        }
    }
    
    pub fn inspect_element(&self, x: f32, y: f32, w: f32, h: f32) {
        if *self.enabled.lock().unwrap() {
            self.debug_rects.lock().unwrap().push((x, y, w, h));
        }
    }
    
    pub fn clear(&self) {
        self.debug_rects.lock().unwrap().clear();
    }
}

impl OmniosPlugin for InspectorPlugin {
    fn name(&self) -> &str { "InspectorPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}
