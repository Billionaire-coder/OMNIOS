use serde::{Serialize, Deserialize};
use taffy::prelude::*;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct LayoutSnapshotFrame {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SnapshotReport {
    pub blueprint_id: String,
    pub frames: Vec<LayoutSnapshotFrame>,
    pub timestamp: u64,
}

pub struct SnapshotGenerator;

impl SnapshotGenerator {
    pub fn generate(
        blueprint_id: &str, 
        taffy: &Taffy, 
        tree_map: &HashMap<String, Node>
    ) -> Result<String, String> {
        let mut frames = Vec::new();

        // 1. Iterate over all tracked nodes in the tree map
        for (id, node) in tree_map.iter() {
            // In a real scenario, we might want to filter only nodes belonging to a specific blueprint/root.
            // For this global MVP, we snapshot everything.
            
            if let Ok(layout) = taffy.layout(*node) {
                frames.push(LayoutSnapshotFrame {
                    id: id.clone(),
                    x: layout.location.x,
                    y: layout.location.y,
                    width: layout.size.width,
                    height: layout.size.height,
                });
            }
        }

        // 2. Deterministic Sort (Critical for Regression Testing)
        // We sort by ID so two identical layouts always produce the exact same JSON array order.
        frames.sort_by(|a, b| a.id.cmp(&b.id));

        let report = SnapshotReport {
            blueprint_id: blueprint_id.to_string(),
            frames,
            timestamp: 0, // Mock timestamp for determinism in testing
        };

        serde_json::to_string_pretty(&report)
            .map_err(|e| format!("Serialization error: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snapshot_determinism() {
        // Setup simple Taffy tree
        let mut taffy = Taffy::new();
        let child = taffy.new_leaf(Style::default()).unwrap();
        let root = taffy.new_with_children(Style::default(), &[child]).unwrap();
        
        taffy.compute_layout(root, Size::MAX_CONTENT).unwrap();

        let mut map = HashMap::new();
        map.insert("root".to_string(), root);
        map.insert("child".to_string(), child);

        // Generate Snapshot A
        let snap_a = SnapshotGenerator::generate("test_bp", &taffy, &map).unwrap();
        
        // Generate Snapshot B (Should be identical)
        let snap_b = SnapshotGenerator::generate("test_bp", &taffy, &map).unwrap();

        assert_eq!(snap_a, snap_b, "Snapshots must be deterministic");
        
        // Verify Content
        assert!(snap_a.contains("root"));
        assert!(snap_a.contains("child"));
    }
}
