use wasm_bindgen::prelude::*;
use lazy_static::lazy_static;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

lazy_static! {
    static ref NEURAL_PREDICTOR: Mutex<NeuralPredictor> = Mutex::new(NeuralPredictor::new());
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PredictionResult {
    pub target_element_id: String,
    pub confidence: f32, // 0.0 to 1.0
    pub predicted_action: String, // e.g., "click"
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TrainingEvent {
    pub velocity: f32,
    pub hoverDuration: f32,
    pub clicked: bool,
}

// Mock TensorFlow Lite Interpreter
pub struct NeuralPredictor {
    // In real implementation: model_bytes: Vec<u8>
    // In real implementation: interpreter: tflite::Interpreter
    pub weights: HashMap<String, f32>,
}

impl NeuralPredictor {
    pub fn new() -> Self {
        // Initialize with dummy weights (Heuristic Perceptron)
        let mut weights = HashMap::new();
        weights.insert("hover_duration".to_string(), 0.5);
        weights.insert("velocity".to_string(), 0.3); // Renamed from velocity_towards for simplicity
        
        Self { weights }
    }

    /// Predicts the user's next move based on telemetry features.
    /// features: {"hover_duration": 1200, "velocity": 0.9, ...}
    pub fn predict_next_interaction(
        &self, 
        element_id: &str, 
        features: &HashMap<String, f32>
    ) -> Option<PredictionResult> {
        
        let mut score = 0.0;
        
        // Dot Product (Features * Weights)
        for (feature, value) in features {
            if let Some(weight) = self.weights.get(feature) {
                // Normalize duration (mock normalization)
                let norm_value = if feature == "hover_duration" {
                    value / 2000.0 // 2 seconds max
                } else {
                    *value
                };
                
                score += norm_value * weight;
            }
        }
        
        // Activation Function (Sigmoid-ish clamp)
        let confidence = score.clamp(0.0, 1.0);

        if confidence > 0.65 {
            Some(PredictionResult {
                target_element_id: element_id.to_string(),
                confidence,
                predicted_action: "click".to_string(),
            })
        } else {
            None
        }
    }

    pub fn train(&mut self, events: Vec<TrainingEvent>) -> String {
        let learning_rate = 0.01;
        let mut changes = 0;

        for event in events {
            if event.clicked {
                // If clicked, reinforce the weights for the features present
                // e.g. If velocity was high, increase velocity weight
                // Logic: weight += learning_rate * feature_value
                
                if let Some(w) = self.weights.get_mut("velocity") {
                    // Velocity is usually pixels/ms. Normalize it approx to 0-1 range (e.g. max 5px/ms)
                    let norm_vel = (event.velocity / 5.0).clamp(0.0, 1.0);
                    *w += learning_rate * norm_vel;
                }
                
                if let Some(w) = self.weights.get_mut("hover_duration") {
                    // Normalize (2s max)
                    let norm_hover = (event.hoverDuration / 2000.0).clamp(0.0, 1.0);
                    *w += learning_rate * norm_hover;
                }
                changes += 1;
            } else {
                // Negative reinforcement?
                // Maybe later.
            }
        }
        
        // Return summary
        format!("Training complete. Processed {} events. New Weights: {:?}", changes, self.weights)
    }
}

// --- WASM Exports ---

#[wasm_bindgen]
pub fn train_neural_model(json_data: &str) -> String {
    let events: Vec<TrainingEvent> = match serde_json::from_str(json_data) {
        Ok(e) => e,
        Err(_) => return "Error parsing JSON".to_string(),
    };

    let mut predictor = NEURAL_PREDICTOR.lock().unwrap();
    predictor.train(events)
}

#[wasm_bindgen]
pub fn get_neural_weights() -> String {
    let predictor = NEURAL_PREDICTOR.lock().unwrap();
    serde_json::to_string(&predictor.weights).unwrap_or_default()
}

#[wasm_bindgen]
pub fn load_neural_weights(json_weights: &str) {
    let weights: HashMap<String, f32> = serde_json::from_str(json_weights).unwrap_or_default();
    let mut predictor = NEURAL_PREDICTOR.lock().unwrap();
    predictor.weights = weights;
}

