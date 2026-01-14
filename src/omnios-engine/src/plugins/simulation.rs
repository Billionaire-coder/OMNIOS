use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LayoutGene {
    pub padding: f32,
    pub gap: f32,
    pub justify_content: String,
    pub align_items: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SimulationResult {
    pub score: f32,
    pub best_config: LayoutGene,
}

pub struct LayoutSimulator {
    rng_seed: u32,
}

impl LayoutSimulator {
    pub fn new(seed: u32) -> Self {
        Self { rng_seed: seed }
    }

    fn rand_range(&mut self, min: f32, max: f32) -> f32 {
        // Simple LCG
        self.rng_seed = (self.rng_seed.wrapping_mul(1103515245).wrapping_add(12345)) % 0x80000000u32;
        let float_val = (self.rng_seed as f32) / (0x80000000u32 as f32);
        min + float_val * (max - min)
    }

    fn rand_choice<'a>(&mut self, choices: &'a [&'a str]) -> &'a str {
        let idx = self.rand_range(0.0, choices.len() as f32) as usize;
        choices[min_idx(idx, choices.len() - 1)]
    }

    pub fn run_simulation(&mut self, iterations: usize) -> SimulationResult {
        let mut best_score = -1.0;
        let mut best_gene = LayoutGene {
            padding: 0.0,
            gap: 0.0,
            justify_content: "flex-start".to_string(),
            align_items: "stretch".to_string(),
        };

        for _ in 0..iterations {
            let gene = self.mutate();
            let score = self.evaluate(&gene);

            if score > best_score {
                best_score = score;
                best_gene = gene;
            }
        }

        SimulationResult {
            score: best_score,
            best_config: best_gene,
        }
    }

    fn mutate(&mut self) -> LayoutGene {
        LayoutGene {
            padding: self.rand_range(0.0, 40.0).round(), // 0px to 40px
            gap: self.rand_range(0.0, 24.0).round(),     // 0px to 24px
            justify_content: self.rand_choice(&["flex-start", "center", "space-between", "space-around"]).to_string(),
            align_items: self.rand_choice(&["start", "center", "stretch"]).to_string(),
        }
    }

    fn evaluate(&self, gene: &LayoutGene) -> f32 {
        // Heuristic Scoring Function (Mocking Taffy computation for now)
        // In real impl: Construct Taffy tree with gene values -> Compute -> Measure overflow/whitespace.
        
        let mut score = 0.0;

        // Preference: Some padding is good, too much is bad
        if gene.padding >= 16.0 && gene.padding <= 32.0 { score += 20.0; }
        if gene.padding < 8.0 { score -= 10.0; }

        // Preference: Balanced spacing
        if gene.justify_content == "space-between" { score += 15.0; }
        if gene.justify_content == "center" { score += 10.0; }

        // Preference: Consistency
        if gene.gap > 8.0 { score += 5.0; }

        // Random jitter to simulate real layout variance
        score
    }
}

fn min_idx(a: usize, b: usize) -> usize {
    if a < b { a } else { b }
}

#[wasm_bindgen]
pub fn run_layout_simulation(iterations: usize) -> String {
    let mut sim = LayoutSimulator::new(12345); // Fixed seed for determinism (or pass time)
    let result = sim.run_simulation(iterations);
    serde_json::to_string(&result).unwrap_or_default()
}
