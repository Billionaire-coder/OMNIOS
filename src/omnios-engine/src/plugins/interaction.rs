use crate::PROJECT_STATE;
use crate::plugins::spatial_index::SPATIAL_INDEX;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct DragConstraint {
    pub min_x: f32,
    pub max_x: f32,
    pub min_y: f32,
    pub max_y: f32,
}

pub struct InteractionPlugin;

impl InteractionPlugin {
    pub fn constrain_drag(element_id: &str, target_x: f32, target_y: f32) -> (f32, f32) {
        let state_guard = PROJECT_STATE.lock().unwrap();
        let state = match &*state_guard {
            Some(s) => s,
            None => return (target_x, target_y),
        };

        // 1. Check if element exists and has a parent
        let element = match state.elements.get(element_id) {
            Some(e) => e,
            None => return (target_x, target_y),
        };

        let parent_id = match &element.parent_id {
            Some(pid) => pid,
            None => return (target_x, target_y), // Root or loose elements move freely
        };

        // 2. Get Parent Bounds from Spatial Index (or Layout Tree directly if preferred)
        let spatial_guard = SPATIAL_INDEX.lock().unwrap();
        let parent_bounds = match spatial_guard.query_one(parent_id) {
            Some(b) => b,
            None => return (target_x, target_y),
        };

        // 3. Get Element Size to prevent dragging out of bounds
        let element_bounds = match spatial_guard.query_one(element_id) {
            Some(b) => b,
            None => return (target_x, target_y),
        };

        let el_width = element_bounds.max_x - element_bounds.min_x;
        let el_height = element_bounds.max_y - element_bounds.min_y;

        // 4. Calculate Constraints (Containment)
        // Ensure element stays inside parent
        let min_x = parent_bounds.min_x;
        let max_x = parent_bounds.max_x - el_width;
        let min_y = parent_bounds.min_y;
        let max_y = parent_bounds.max_y - el_height;

        let constrained_x = target_x.max(min_x).min(max_x);
        let constrained_y = target_y.max(min_y).min(max_y);

        (constrained_x, constrained_y)
    }

    pub fn get_group_bounds(element_ids: Vec<String>) -> Option<(f32, f32, f32, f32)> {
        let spatial_guard = SPATIAL_INDEX.lock().unwrap();
        
        let mut min_x = f32::MAX;
        let mut min_y = f32::MAX;
        let mut max_x = f32::MIN;
        let mut max_y = f32::MIN;
        let mut found_any = false;

        for id in element_ids {
            if let Some(bounds) = spatial_guard.query_one(&id) {
                if bounds.min_x < min_x { min_x = bounds.min_x; }
                if bounds.min_y < min_y { min_y = bounds.min_y; }
                if bounds.max_x > max_x { max_x = bounds.max_x; }
                if bounds.max_y > max_y { max_y = bounds.max_y; }
                found_any = true;
            }
        }

        if found_any {
            let width = max_x - min_x;
            let height = max_y - min_y;
            Some((min_x, min_y, width, height))
        } else {
            None
        }
    }

    pub fn find_snap_targets(
        element_id: &str,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
        threshold: f32,
    ) -> SnapResult {
        let spatial_guard = SPATIAL_INDEX.lock().unwrap();
        // Ideally we would use spatial_guard.query_area to limit search, 
        // but for now we'll iterate to ensure we catch all edges.
        
        let mut snapped_x = None;
        let mut snapped_y = None;
        let mut guides = Vec::new();

        let mut best_dist_x = threshold;
        let mut best_dist_y = threshold;

        // Edges of the moving element
        let l = x;
        let c_x = x + width / 2.0;
        let r = x + width;

        let t = y;
        let m_y = y + height / 2.0;
        let b = y + height;

        // Iterate all elements (Naive O(N) but fast enough for <1000 items in WASM)
        for (other_id, bounds) in spatial_guard.iter_all() {
            if other_id == element_id { continue; } // Don't snap to self

            let other_w = bounds.max_x - bounds.min_x;
            let other_h = bounds.max_y - bounds.min_y;

            let ol = bounds.min_x;
            let oc_x = bounds.min_x + other_w / 2.0;
            let or = bounds.max_x;

            let ot = bounds.min_y;
            let om_y = bounds.min_y + other_h / 2.0;
            let ob = bounds.max_y;

            // --- X Axis Snapping ---
            // Left to Left
            if (l - ol).abs() < best_dist_x { best_dist_x = (l - ol).abs(); snapped_x = Some(ol); }
            // Left to Right
            if (l - or).abs() < best_dist_x { best_dist_x = (l - or).abs(); snapped_x = Some(or); }
            // Right to Right
            if (r - or).abs() < best_dist_x { best_dist_x = (r - or).abs(); snapped_x = Some(or - width); }
            // Right to Left
            if (r - ol).abs() < best_dist_x { best_dist_x = (r - ol).abs(); snapped_x = Some(ol - width); }
            // Center to Center
            if (c_x - oc_x).abs() < best_dist_x { best_dist_x = (c_x - oc_x).abs(); snapped_x = Some(oc_x - width / 2.0); }

            // --- Y Axis Snapping ---
            // Top to Top
            if (t - ot).abs() < best_dist_y { best_dist_y = (t - ot).abs(); snapped_y = Some(ot); }
            // Top to Bottom
            if (t - ob).abs() < best_dist_y { best_dist_y = (t - ob).abs(); snapped_y = Some(ob); }
            // Bottom to Bottom
            if (b - ob).abs() < best_dist_y { best_dist_y = (b - ob).abs(); snapped_y = Some(ob - height); }
            // Bottom to Top
            if (b - ot).abs() < best_dist_y { best_dist_y = (b - ot).abs(); snapped_y = Some(ot - height); }
            // Middle to Middle
            if (m_y - om_y).abs() < best_dist_y { best_dist_y = (m_y - om_y).abs(); snapped_y = Some(om_y - height / 2.0); }
        }

        // Generate Guides
        if let Some(sx) = snapped_x {
            guides.push(SnapGuide { orientation: "vertical".to_string(), value: sx, label: "".to_string() });
             // Also add right edge guide if we snapped right edge
             if (sx + width - x - width).abs() < 0.1 { // If we snapped strictly by the left edge
                 // Just left guide
             } else {
                 // It's ambiguous which edge triggered, usually UI just draws a line at the snap position 
                 // or the relevant edge. For MVP, we pass the snapped X position.
             }
        }
        if let Some(sy) = snapped_y {
            guides.push(SnapGuide { orientation: "horizontal".to_string(), value: sy, label: "".to_string() });
        }

        SnapResult {
            x: snapped_x.unwrap_or(x),
            y: snapped_y.unwrap_or(y),
            guides,
        }
    }
}

#[derive(serde::Serialize, Debug)]
pub struct SnapGuide {
    pub orientation: String, // "vertical" | "horizontal"
    pub value: f32,
    pub label: String,
}

#[derive(serde::Serialize, Debug)]
pub struct SnapResult {
    pub x: f32,
    pub y: f32,
    pub guides: Vec<SnapGuide>,
}
