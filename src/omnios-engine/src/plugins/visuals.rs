use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::sync::{Arc, Mutex};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, CanvasRenderingContext2d};

// --- Plugin 1: ParticlesPlugin (Advanced Emitter) ---
// Expands strictly on SnowPlugin by adding types (Fire, Smoke)
#[derive(Debug, Clone)]
pub enum ParticleType { Snow, Fire, Smoke }

pub struct Particle {
    pub x: f32,
    pub y: f32,
    pub vx: f32,
    pub vy: f32,
    pub life: f32,
    pub p_type: ParticleType,
}

pub struct ParticlesPlugin {
    pub particles: Arc<Mutex<Vec<Particle>>>,
}

impl ParticlesPlugin {
    pub fn new() -> Self {
        Self { particles: Arc::new(Mutex::new(Vec::new())) }
    }
    
    pub fn emit(&self, x: f32, y: f32, p_type: ParticleType) {
        let mut parts = self.particles.lock().unwrap();
        let (vx, vy, life) = match p_type {
            ParticleType::Snow => (0.0, 1.0, 5.0),
            ParticleType::Fire => (0.0, -2.0, 1.0), // Goes up fast, dies fast
            ParticleType::Smoke => (0.5, -0.5, 3.0),
        };
        
        parts.push(Particle { x, y, vx, vy, life, p_type });
    }
    
    pub fn update(&self, dt: f32) {
        let mut parts = self.particles.lock().unwrap();
        // Move & Age
        for p in parts.iter_mut() {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        }
        // Remove dead
        parts.retain(|p| p.life > 0.0);
    }
}

impl OmniosPlugin for ParticlesPlugin {
    fn name(&self) -> &str { "ParticlesPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
    fn render(&self, _ctx: &RenderContext) { 
        self.update(0.016);

        #[cfg(feature = "browser")]
        {
            use wasm_bindgen::JsCast;
            // Zero-Budget Canvas Access: Find by ID every frame (Optimization: Cache this later)
            // We assume canvas ID is "hyper-canvas"
            if let Some(window) = web_sys::window() {
                if let Some(document) = window.document() {
                    if let Some(canvas) = document.get_element_by_id("hyper-canvas") {
                        if let Ok(canvas_el) = canvas.dyn_into::<web_sys::HtmlCanvasElement>() {
                            if let Ok(Some(ctx_obj)) = canvas_el.get_context("2d") {
                                if let Ok(ctx) = ctx_obj.dyn_into::<web_sys::CanvasRenderingContext2d>() {
                                    // Clear (or let the main loop clear? Main loop clears in lib.rs? 
                                    // lib.rs start_engine draws ONCE. We need a clear loop.
                                    // Let's assume this plugin OWNS the canvas for now or clears only its dirty rects.
                                    // For safety, clear everything.
                                    ctx.clear_rect(0.0, 0.0, canvas_el.width() as f64, canvas_el.height() as f64);
                                    
                                    let parts = self.particles.lock().unwrap();
                                    for p in parts.iter() {
                                        ctx.begin_path();
                                        match p.p_type {
                                            ParticleType::Snow => {
                                                ctx.set_fill_style_str("white");
                                                ctx.arc(p.x as f64, p.y as f64, 3.0, 0.0, 6.28).unwrap();
                                            },
                                            ParticleType::Fire => {
                                                ctx.set_fill_style_str("rgba(255, 100, 0, 0.8)");
                                                ctx.rect(p.x as f64, p.y as f64, 5.0, 5.0);
                                            },
                                            ParticleType::Smoke => {
                                                ctx.set_fill_style_str("rgba(100, 100, 100, 0.5)");
                                                ctx.arc(p.x as f64, p.y as f64, 5.0, 0.0, 6.28).unwrap();
                                            }
                                        }
                                        ctx.fill();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Plugin 2: FilterPlugin (Post-Processing) ---
pub struct FilterPlugin {
    pub active_filter: Arc<Mutex<Option<String>>>, // "blur", "sepia"
}

impl FilterPlugin {
    pub fn new() -> Self {
        Self { active_filter: Arc::new(Mutex::new(None)) }
    }
    
    pub fn set_filter(&self, name: &str) {
        *self.active_filter.lock().unwrap() = Some(name.to_string());
    }
}

impl OmniosPlugin for FilterPlugin {
    fn name(&self) -> &str { "FilterPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
    // Render logic would typically modify the WebGL/Canvas context state here
}
