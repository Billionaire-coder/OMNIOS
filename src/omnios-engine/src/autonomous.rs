use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref EXPERIMENT_REGISTRY: Mutex<HashMap<String, Experiment>> = Mutex::new(HashMap::new());
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Experiment {
    pub id: String,
    pub element_id: String,
    pub variants: Vec<Variant>,
    pub status: ExperimentStatus,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Variant {
    pub id: String,
    pub weight: f32, // 0.0 to 1.0
    pub conversions: u32,
    pub impressions: u32,
    pub styles_override: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ExperimentStatus {
    Active,
    Paused,
    Completed,
}

pub struct AutonomousEngine;

impl AutonomousEngine {
    pub fn create_experiment(id: &str, element_id: &str, variants: Vec<Variant>) {
        let mut registry = EXPERIMENT_REGISTRY.lock().unwrap();
        registry.insert(id.to_string(), Experiment {
            id: id.to_string(),
            element_id: element_id.to_string(),
            variants,
            status: ExperimentStatus::Active,
        });
    }

    pub fn record_impression(experiment_id: &str, variant_id: &str) {
        let mut registry = EXPERIMENT_REGISTRY.lock().unwrap();
        if let Some(exp) = registry.get_mut(experiment_id) {
            if let Some(v) = exp.variants.iter_mut().find(|v| v.id == variant_id) {
                v.impressions += 1;
            }
        }
    }

    pub fn record_conversion(experiment_id: &str, variant_id: &str) {
        let mut registry = EXPERIMENT_REGISTRY.lock().unwrap();
        if let Some(exp) = registry.get_mut(experiment_id) {
            if let Some(v) = exp.variants.iter_mut().find(|v| v.id == variant_id) {
                v.conversions += 1;
                Self::recalculate_weights(exp);
            }
        }
    }

    fn recalculate_weights(exp: &mut Experiment) {
        // Multi-armed bandit strategy (Thompson Sampling or simplified greedy)
        // For now, let's use a simple Performance-to-Weight ratio
        let mut total_score = 0.0;
        let mut scores = Vec::new();

        for v in &exp.variants {
            let cr = if v.impressions > 0 {
                v.conversions as f32 / v.impressions as f32
            } else {
                0.1 // Base explore weight
            };
            scores.push(cr);
            total_score += cr;
        }

        if total_score > 0.0 {
            for (i, v) in exp.variants.iter_mut().enumerate() {
                v.weight = scores[i] / total_score;
            }
        }
    }

    pub fn select_variant(experiment_id: &str) -> Option<Variant> {
        let registry = EXPERIMENT_REGISTRY.lock().unwrap();
        let exp = registry.get(experiment_id)?;
        
        // Roulette wheel selection
        let mut r: f32 = rand_val(); // 0.0 to 1.0 from JS or internal mock
        for v in &exp.variants {
            if r <= v.weight {
                return Some(v.clone());
            }
            r -= v.weight;
        }
        exp.variants.get(0).cloned()
    }
}

// Mock random generator since std::rand isn't easily available in WASM target without extra crates
fn rand_val() -> f32 {
    static mut SEED: u32 = 42;
    unsafe {
        SEED = SEED.wrapping_mul(1664525).wrapping_add(1013904223);
        (SEED as f32) / (u32::MAX as f32)
    }
}
