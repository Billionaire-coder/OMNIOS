use rstar::{RTree, RTreeObject, AABB};
use crate::sdk::{OmniosPlugin, PluginContext};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    pub static ref SPATIAL_INDEX: Mutex<SpatialIndex> = Mutex::new(SpatialIndex::new());
}

#[derive(Clone, Debug, PartialEq)] // Removed Copy, PartialEq is usually good enough for RTree
pub struct ElementBounds {
    pub id: String,
    pub min_x: f32,
    pub min_y: f32,
    pub max_x: f32,
    pub max_y: f32,
}

impl RTreeObject for ElementBounds {
    type Envelope = AABB<[f32; 2]>;

    fn envelope(&self) -> Self::Envelope {
        AABB::from_corners([self.min_x, self.min_y], [self.max_x, self.max_y])
    }
}

pub struct SpatialIndex {
    pub tree: RTree<ElementBounds>,
    element_map: HashMap<String, ElementBounds>, // Quick lookup to update/remove
}

impl SpatialIndex {
    pub fn new() -> Self {
        Self {
            tree: RTree::new(),
            element_map: HashMap::new(),
        }
    }

    pub fn insert_or_update(&mut self, id: String, x: f32, y: f32, width: f32, height: f32) {
        // Remove existing if present
        if let Some(old_bounds) = self.element_map.remove(&id) {
            self.tree.remove(&old_bounds);
        }

        let new_bounds = ElementBounds {
            id: id.clone(),
            min_x: x,
            min_y: y,
            max_x: x + width,
            max_y: y + height,
        };

        self.tree.insert(new_bounds.clone());
        self.element_map.insert(id, new_bounds);
    }

    pub fn remove(&mut self, id: &str) {
        if let Some(old_bounds) = self.element_map.remove(id) {
            self.tree.remove(&old_bounds);
        }
    }

    pub fn query_one(&self, id: &str) -> Option<ElementBounds> {
        self.element_map.get(id).cloned()
    }

    pub fn hit_test(&self, x: f32, y: f32) -> Option<String> {
        // Find all elements containing the point
        let envelope = AABB::from_point([x, y]);
        let candidates: Vec<&ElementBounds> = self.tree.locate_in_envelope(&envelope).collect();
        
        // Z-Index handling would go here, for now return the smallest one (most likely nested child)
        // Heuristic: Smallest area is usually the deepest child
        let best_match = candidates.into_iter().min_by(|a, b| {
            let area_a = (a.max_x - a.min_x) * (a.max_y - a.min_y);
            let area_b = (b.max_x - b.min_x) * (b.max_y - b.min_y);
            area_a.partial_cmp(&area_b).unwrap_or(std::cmp::Ordering::Equal)
        });

        best_match.map(|b| b.id.clone())
    }
    
    pub fn get_bounds(&self, id: &str) -> Option<(f32, f32, f32, f32)> {
        self.element_map.get(id).map(|b| (b.min_x, b.min_y, b.max_x - b.min_x, b.max_y - b.min_y))
    }
    
    pub fn query_area(&self, x: f32, y: f32, width: f32, height: f32) -> Vec<String> {
        let envelope = AABB::from_corners([x, y], [x + width, y + height]);
        self.tree.locate_in_envelope(&envelope)
            .map(|b| b.id.clone())
            .collect()
    }

    pub fn clear(&mut self) {
        self.tree = RTree::new();
        self.element_map.clear();
    }

    // NEW: Batch 25.3 - Required for Snap logic (Naive Iterate)
    pub fn iter_all(&self) -> impl Iterator<Item = (&String, &ElementBounds)> {
        self.element_map.iter()
    }
}

impl OmniosPlugin for SpatialIndex {
    fn name(&self) -> &str { "SpatialIndex" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}

// --- WASM Exports ---

#[wasm_bindgen]
pub fn update_element_bounds(id: &str, x: f32, y: f32, width: f32, height: f32) {
    let mut index = SPATIAL_INDEX.lock().unwrap();
    index.insert_or_update(id.to_string(), x, y, width, height);
}

#[wasm_bindgen]
pub fn remove_element_bounds(id: &str) {
    let mut index = SPATIAL_INDEX.lock().unwrap();
    index.remove(id);
}

#[wasm_bindgen]
pub fn query_area(x: f32, y: f32, width: f32, height: f32) -> JsValue {
    let index = SPATIAL_INDEX.lock().unwrap();
    let ids = index.query_area(x, y, width, height);
    serde_json::to_string(&ids).unwrap_or_else(|_| "[]".to_string()).into()
}

#[wasm_bindgen]
pub fn hit_test(x: f32, y: f32) -> Option<String> {
    let index = SPATIAL_INDEX.lock().unwrap();
    index.hit_test(x, y)
}

#[wasm_bindgen]
pub fn clear_spatial_index() {
    let mut index = SPATIAL_INDEX.lock().unwrap();
    index.clear();
}

#[wasm_bindgen]
pub fn get_element_bounds(id: &str) -> Option<Vec<f32>> {
    let index = SPATIAL_INDEX.lock().unwrap();
    index.get_bounds(id).map(|(x, y, w, h)| vec![x, y, w, h])
}
