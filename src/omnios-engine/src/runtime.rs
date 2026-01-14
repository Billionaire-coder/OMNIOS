use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::ProjectState;
use crate::PROJECT_STATE;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RuntimeContext {
    pub variables: HashMap<String, serde_json::Value>,
    pub execution_trace: Vec<String>,
}

impl RuntimeContext {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
            execution_trace: Vec::new(),
        }
    }

    pub fn set_variable(&mut self, key: &str, value: serde_json::Value) {
        self.variables.insert(key.to_string(), value);
    }

    pub fn get_variable(&self, key: &str) -> Option<&serde_json::Value> {
        self.variables.get(key)
    }
}

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn execute_headless_flow(blueprint_id: &str, input_json: &str) -> Result<String, JsValue> {
    let input: serde_json::Value = serde_json::from_str(input_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON Input: {}", e)))?;

    let state_guard = PROJECT_STATE.lock().map_err(|e| e.to_string())
        .map_err(|e| JsValue::from_str(&e))?;
    
    let state = state_guard.as_ref().ok_or_else(|| JsValue::from_str("No active project state"))?;

    let blueprint = state.blueprints.get(blueprint_id)
        .ok_or_else(|| JsValue::from_str(&format!("Blueprint {} not found", blueprint_id)))?;

    // Simple execution simulation for now
    let mut context = RuntimeContext::new();
    context.set_variable("input", input.clone());
    
    // Logic Kernel hook (mock)
    // In real implementation: 
    // let result = crate::LOGIC_KERNEL.lock().unwrap().execute(blueprint_id, "start", &input);
    
    let result = serde_json::json!({
        "status": "success",
        "blueprint": blueprint_id,
        "input_echo": input,
        "execution_env": "headless_rust",
        "timestamp": 123456789
    });

    serde_json::to_string(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}
