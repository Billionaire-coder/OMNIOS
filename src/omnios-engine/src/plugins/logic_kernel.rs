use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::sdk::{OmniosPlugin, PluginContext};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedNode {
    pub id: String,
    pub r#type: String,
    pub data: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedConnection {
    pub id: String,
    pub from_id: String,
    pub to_id: String,
    pub port: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedBlueprint {
    pub id: String,
    pub nodes: HashMap<String, UnifiedNode>,
    pub connections: Vec<UnifiedConnection>,
    pub variables: HashMap<String, serde_json::Value>,
}

use crate::core::secrets::SecretStore;

pub struct LogicKernel {
    pub blueprints: HashMap<String, UnifiedBlueprint>,
    pub runtime_variables: HashMap<String, serde_json::Value>,
    pub secrets: SecretStore,
    pub max_steps: usize,
    pub step_count: usize,
}

impl LogicKernel {
    pub fn new() -> Self {
        Self {
            blueprints: HashMap::new(),
            runtime_variables: HashMap::new(),
            secrets: SecretStore::new(),
            max_steps: 1000, // Default Safety Limit
            step_count: 0,
        }
    }

    pub fn register_blueprint(&mut self, bp: UnifiedBlueprint) {
        self.blueprints.insert(bp.id.clone(), bp);
    }

    pub fn execute(&mut self, blueprint_id: &str, trigger_type: &str, payload: &serde_json::Value) {
        self.step_count = 0; // Reset Gas Meter
        
        if let Some(bp) = self.blueprints.get(blueprint_id).cloned() {
            // Find start nodes
            let start_nodes: Vec<&UnifiedNode> = bp.nodes.values()
                .filter(|n| n.r#type == trigger_type)
                .collect();

            for node in start_nodes {
                self.execute_node(&bp, node, payload);
            }
        }
    }

    fn execute_node(&mut self, bp: &UnifiedBlueprint, node: &UnifiedNode, payload: &serde_json::Value) {
        if self.step_count >= self.max_steps {
            log::error!("[LogicKernel] Gas Limit Exceeded ({} steps). Terminating execution loop.", self.max_steps);
            return;
        }
        self.step_count += 1;

        log::info!("[LogicKernel] Executing: {} ({}) [Step: {}]", node.id, node.r#type, self.step_count);

        let mut next_port = "default".to_string();

        match node.r#type.as_str() {
            "set_var" => {
                if let Some(var_name) = node.data.get("varName").and_then(|v| v.as_str()) {
                    let value = node.data.get("value").cloned().unwrap_or(serde_json::Value::Null);
                    self.runtime_variables.insert(var_name.to_string(), value);
                }
            },
            "condition" => {
                // Simplified condition logic for parity
                let left = node.data.get("left").unwrap_or(&serde_json::Value::Null);
                let right = node.data.get("right").unwrap_or(&serde_json::Value::Null);
                let op = node.data.get("operator").and_then(|v| v.as_str()).unwrap_or("==");

                let result = match op {
                    "==" => left == right,
                    "!=" => left != right,
                    _ => false,
                };
                next_port = if result { "true".to_string() } else { "false".to_string() };
            },
            _ => {
                // Actions that require UI side-effects (navigate, alert, etc.)
                // are emitted as triggers back to the bridge.
                log::info!("[LogicKernel] Action {} requires UI side-effects.", node.r#type);
            }
        }

        // Traverse to next nodes
        let next_connections: Vec<&UnifiedConnection> = bp.connections.iter()
            .filter(|c| {
                if next_port != "default" {
                    c.from_id == node.id && c.port.as_ref() == Some(&next_port)
                } else {
                    c.from_id == node.id
                }
            })
            .collect();

        for conn in next_connections {
            if let Some(next_node) = bp.nodes.get(&conn.to_id) {
                self.execute_node(bp, next_node, payload);
            }
        }
    }
}

impl OmniosPlugin for LogicKernel {
    fn name(&self) -> &str { "LogicKernel" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}
