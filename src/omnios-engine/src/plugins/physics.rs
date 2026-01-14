use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// --- MOCK PHYSICS ENGINE (Rapier2D Lite) ---
// Simplified Euler integration for RigidBody dynamics.

#[derive(Clone, Copy, Debug)]
pub struct RigidBody {
    pub x: f32,
    pub y: f32,
    pub vx: f32,
    pub vy: f32,
    pub mass: f32,
    pub is_static: bool,
}

pub struct RigidBodyPlugin {
    pub bodies: Arc<Mutex<HashMap<String, RigidBody>>>,
    pub gravity: f32,
}

impl RigidBodyPlugin {
    pub fn new() -> Self {
        Self {
            bodies: Arc::new(Mutex::new(HashMap::new())),
            gravity: 9.81, // m/s^2
        }
    }
    
    pub fn add_body(&self, id: &str, x: f32, y: f32, is_static: bool) {
        let body = RigidBody { x, y, vx: 0.0, vy: 0.0, mass: 1.0, is_static };
        self.bodies.lock().unwrap().insert(id.to_string(), body);
    }

    pub fn clear(&self) {
        self.bodies.lock().unwrap().clear();
    }
    
    // Physics Step (Called every frame)
    pub fn step(&self, dt: f32) {
        let mut bodies = self.bodies.lock().unwrap();
        
        // 1. Apply Gravity & Velocity
        for body in bodies.values_mut() {
            if body.is_static { continue; }
            
            body.vy += self.gravity * dt;
            body.x += body.vx * dt;
            body.y += body.vy * dt;
            
            // simple floor collision
            if body.y > 500.0 {
                body.y = 500.0;
                body.vy = -body.vy * 0.5; // Bounce with restitution
                if body.vy.abs() < 0.1 { body.vy = 0.0; } // Sleep
            }
        }
    }

    pub fn get_state(&self) -> HashMap<String, (f32, f32)> {
        let bodies = self.bodies.lock().unwrap();
        bodies.iter().map(|(id, b)| (id.clone(), (b.x, b.y))).collect()
    }

    pub fn get_batch_transforms(&self) -> Vec<f32> {
        let bodies = self.bodies.lock().unwrap();
        let mut data = Vec::with_capacity(bodies.len() * 3);
        for (id, body) in bodies.iter() {
            // Simple string hash to f32 for identification in JS
            let hash = id.chars().fold(5381u32, |acc, c| {
                (acc << 5).wrapping_add(acc).wrapping_add(c as u32)
            }) as f32;
            
            data.push(hash);
            data.push(body.x);
            data.push(body.y);
        }
        data
    }
}

impl OmniosPlugin for RigidBodyPlugin {
    fn name(&self) -> &str { "RigidBodyPlugin" }
    
    fn on_register(&mut self, _context: &mut PluginContext) {}

    fn render(&self, _ctx: &RenderContext) {
        // Step physics at 60fps assumption (dt = 0.016)
        self.step(0.016);
    }
}
