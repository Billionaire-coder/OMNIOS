use std::collections::HashMap;
use crate::{UnifiedBlueprint, UnifiedNode};

pub struct BundleAnalyzer;

impl BundleAnalyzer {
    pub fn analyze(blueprint: &UnifiedBlueprint) -> String {
        let mut report = String::new();
        
        let node_count = blueprint.nodes.len();
        let connection_count = blueprint.connections.len();
        let variable_count = blueprint.variables.len();
        
        // 1. Header & Complexity Score
        report.push_str(&format!("# Optimization Report: {}\n", blueprint.id));
        report.push_str(&format!("- **Nodes:** {}\n", node_count));
        report.push_str(&format!("- **Connections:** {}\n", connection_count));
        report.push_str(&format!("- **Variables:** {}\n", variable_count));
        
        let complexity_score = (node_count as f32 * 1.0) + (connection_count as f32 * 1.5);
        report.push_str(&format!("- **Complexity Score:** {:.1}\n\n", complexity_score));

        // 2. Identify Entry Points (Triggers)
        report.push_str("## Entry Points\n");
        let triggers: Vec<&UnifiedNode> = blueprint.nodes.values()
            .filter(|n| n.r#type.contains("trigger") || n.r#type == "on_load" || n.r#type == "on_click")
            .collect();
            
        if triggers.is_empty() {
            report.push_str("*No clear entry points found.*\n");
        } else {
            for trigger in &triggers {
                report.push_str(&format!("- `{}` (ID: {})\n", trigger.r#type, trigger.id));
            }
        }
        report.push('\n');

        // 3. Semantic AST (Simplified Flow)
        report.push_str("## Semantic Flow\n");
        // For now, we list nodes by type to give the AI a "bag of words" understanding of capabilities
        // A full graph traversal for text representation is complex, so we group by type.
        let mut node_types: HashMap<String, usize> = HashMap::new();
        for node in blueprint.nodes.values() {
            *node_types.entry(node.r#type.clone()).or_insert(0) += 1;
        }
        
        for (node_type, count) in node_types {
            report.push_str(&format!("- [{} x{}]\n", node_type, count));
        }
        
        // 4. Optimization Candidates (Heuristics)
        report.push_str("\n## AI Split Candidates\n");
        if complexity_score > 50.0 {
            report.push_str("- ⚠️ **High Complexity:** Consider splitting this blueprint into smaller sub-flows.\n");
        }
        if variable_count > 20 {
            report.push_str("- ⚠️ **State Heavy:** Too many local variables. Consider using Global State.\n");
        }
        if triggers.len() > 5 {
            report.push_str("- ℹ️ **Multi-Trigger:** This blueprint handles too many events. Isolate by event type?\n");
        }
        if report.ends_with("Candidates\n") {
            report.push_str("*No obvious optimizations detected.*\n");
        }

        report
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use crate::{UnifiedBlueprint, UnifiedNode};

    #[test]
    fn test_analyzer_report() {
        // 1. Setup Mock Blueprint
        let mut nodes = HashMap::new();
        nodes.insert("node1".to_string(), UnifiedNode {
            id: "node1".to_string(),
            r#type: "on_click".to_string(),
            name: "Click Me".to_string(),
            data: serde_json::json!({}),
            inputs: vec![],
            outputs: vec![],
            position: HashMap::new(),
        });
        
        // Add a "heavy" node to test heuristics
        nodes.insert("node2".to_string(), UnifiedNode {
            id: "node2".to_string(),
            r#type: "complex_calculation".to_string(),
            name: "Calc".to_string(),
            data: serde_json::json!({}),
            inputs: vec![],
            outputs: vec![],
            position: HashMap::new(),
        });

        let blueprint = UnifiedBlueprint {
            id: "test_bp".to_string(),
            nodes,
            connections: vec![], // Empty for simplicity
            variables: HashMap::new(),
        };

        // 2. Run Analysis
        let report = BundleAnalyzer::analyze(&blueprint);

        // 3. Verify Output
        assert!(report.contains("# Optimization Report: test_bp"));
        assert!(report.contains("- **Nodes:** 2"));
        assert!(report.contains("- `on_click` (ID: node1)")); // Entry point detected?
        assert!(report.contains("- [on_click x1]")); // Semantic count
    }
}
