use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::plugins::spatial_index::SPATIAL_INDEX;

#[derive(Serialize, Deserialize, Debug)]
pub struct LayoutSnapshot {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParityReport {
    pub average_drift: f32,
    pub flagged_elements: Vec<String>, // IDs of elements with >1% drift
}

#[wasm_bindgen]
pub fn get_full_layout_dump() -> String {
    let index = SPATIAL_INDEX.lock().unwrap();
    let mut snapshots = Vec::new();

    // SPATIAL_INDEX stores RTree<ElementBounds>.
    // "item" will be &ElementBounds
    for item in index.tree.iter() {
        snapshots.push(LayoutSnapshot {
            id: item.id.clone(),
            x: item.min_x,
            y: item.min_y,
            width: item.max_x - item.min_x,
            height: item.max_y - item.min_y,
        });
    }

    serde_json::to_string(&snapshots).unwrap_or_default()
}

#[wasm_bindgen]
pub fn compute_parity_score(dom_dump_json: &str) -> String {
    let dom_snapshots: Vec<LayoutSnapshot> = match serde_json::from_str(dom_dump_json) {
        Ok(s) => s,
        Err(_) => return "{\"average_drift\": 0.0, \"flagged_elements\": []}".to_string(),
    };

    let index = SPATIAL_INDEX.lock().unwrap();
    let mut total_drift = 0.0;
    let mut count = 0;
    let mut flagged = Vec::new();

    for dom_item in dom_snapshots {
        // Find corresponding Rust item
        // Linear search over tree items
        let rust_item = index.tree.iter().find(|i| i.id == dom_item.id);
        
        if let Some(rust_item) = rust_item {
             let r_x = rust_item.min_x;
             let r_y = rust_item.min_y;
             let r_w = rust_item.max_x - rust_item.min_x;
             let r_h = rust_item.max_y - rust_item.min_y;

             // Compute Drift (Euclidean distance of Top-Left + Size diff)
             let pos_drift = ((r_x - dom_item.x).powi(2) + (r_y - dom_item.y).powi(2)).sqrt();
             let size_drift = ((r_w - dom_item.width).abs() + (r_h - dom_item.height).abs());
             
             let total_local_drift = pos_drift + size_drift;
             
             total_drift += total_local_drift;
             count += 1;

             if total_local_drift > 2.0 { // 2 pixels tolerance
                 flagged.push(dom_item.id);
             }
        }
    }

    let avg = if count > 0 { total_drift / count as f32 } else { 0.0 };

    let report = ParityReport {
        average_drift: avg,
        flagged_elements: flagged,
    };

    serde_json::to_string(&report).unwrap_or_default()
}
