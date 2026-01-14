use crate::ProjectState;
use crate::plugins::spatial_index::SPATIAL_INDEX;
use crate::TAFFY;
use crate::DesignerElement;
use std::collections::HashMap;
use taffy::prelude::*;
use taffy::style::{AvailableSpace, Dimension, LengthPercentage, Display, FlexDirection};
use taffy::geometry::{Size, Rect};

pub fn compute_project_layout(state: &ProjectState) -> Result<(), String> {
    let mut taffy = TAFFY.lock().unwrap();
    *taffy = Taffy::new(); // Clear old layout tree

    let mut node_map: HashMap<String, Node> = HashMap::new();
    // let mut children_map: HashMap<String, Vec<Node>> = HashMap::new(); // Unused

    // 1. First Pass: Create Taffy Nodes for all elements
    // We iterate arbitrarily, but we need to ensure children are attached to parents later.
    // Taffy requires creating a node with children IDs if possible, or adding children later.
    // Taffy's new_leaf / new_with_children interface suggests we might want to build bottom-up or just use `add_child`.
    // Actually `add_child` is easier.

    for (id, element) in &state.elements {
        let style = map_style(element);
        // Using new_leaf initially, we'll attach children later
        let node = taffy.new_leaf(style).map_err(|e| e.to_string())?;
        node_map.insert(id.clone(), node);
    }

    // 2. Second Pass: Construct Hierarchy
    for (id, element) in &state.elements {
        if let Some(parent_id) = &element.parent_id {
            if let Some(parent_node) = node_map.get(parent_id) {
                if let Some(child_node) = node_map.get(id) {
                    taffy.add_child(*parent_node, *child_node).map_err(|e| e.to_string())?;
                }
            }
        } else {
             // It's a root (or orphan)
        }
    }

    // 3. Find Root(s) and Compute Layout
    // Assuming single root for now, or we iterate roots. 
    // Usually 'root' or elements with no parent.
    let roots: Vec<String> = state.elements.keys()
        .filter(|id| state.elements[*id].parent_id.is_none())
        .cloned()
        .collect();

    for root_id in roots {
        if let Some(root_node) = node_map.get(&root_id) {
            // Compute layout for this root
            // Size::MAX_CONTENT or assumed viewport size?
            // "Zero-Budget View" implies we map the viewport.
            // Let's assume 1920x1080 for Hyper Viewport or use global settings if available.
            // For now, Available space.
            let available_space = Size { width: AvailableSpace::MaxContent, height: AvailableSpace::MaxContent };
            taffy.compute_layout(*root_node, available_space).map_err(|e| e.to_string())?;
        }
    }

    // 4. Update Spatial Index
    let mut index = SPATIAL_INDEX.lock().unwrap();
    index.clear();

    for (id, node) in &node_map {
        let layout = taffy.layout(*node).map_err(|e| e.to_string())?;
        
        // Note: Taffy returns relative coordinates. We need absolute coordinates for hit testing.
        // We must traverse down from root adding parent offsets.
        // Or essentially, Taffy has no "get_absolute_position" helper?
        // We have to compute it manually by traversing up?
        // Wait, Taffy 0.3 might not have absolute coords unless we walk.
        // Let's do a walker.
        
        let (x, y) = get_absolute_position(&taffy, *node, &node_map);
        
        index.insert_or_update(
            id.clone(),
            x,
            y,
            layout.size.width,
            layout.size.height
        );
    }

    Ok(())
}

fn get_absolute_position(taffy: &Taffy, node: Node, map: &HashMap<String, Node>) -> (f32, f32) {
    let layout = taffy.layout(node).unwrap();
    let mut x = layout.location.x;
    let mut y = layout.location.y;
    
    // This is slow (O(Depth)) per node. O(N*Depth) total. OK for <1000 nodes.
    // Optimization: DFS traversal carrying offset.
    // For now, simple parent walk.
    
    let mut current = node;
    while let Some(parent) = taffy.parent(current) {
        let parent_layout = taffy.layout(parent).unwrap();
        x += parent_layout.location.x;
        y += parent_layout.location.y;
        current = parent;
    }
    
    (x, y)
}

fn map_style(element: &DesignerElement) -> Style {
    let mut style = Style::default();

    if let Some(s) = &element.styles {
        // Display
        if let Some(d) = s.get("display").and_then(|v| v.as_str()) {
            style.display = match d {
                "none" => Display::None,
                "flex" => Display::Flex,
                "grid" => Display::Grid,
                _ => Display::Flex, // Default to Flex (Taffy default)
            };
        }

        // Flex Direction
        if let Some(fd) = s.get("flexDirection").and_then(|v| v.as_str()) {
             style.flex_direction = match fd {
                 "row" => FlexDirection::Row,
                 "column" => FlexDirection::Column,
                 "row-reverse" => FlexDirection::RowReverse,
                 "column-reverse" => FlexDirection::ColumnReverse,
                 _ => FlexDirection::Row,
             };
        }
        
        // Dimensions (Width/Height)
        if let Some(w) = s.get("width") { style.size.width = parse_dim(w); }
        if let Some(h) = s.get("height") { style.size.height = parse_dim(h); }
        
        // Min/Max Dimensions
        if let Some(w) = s.get("minWidth") { style.min_size.width = parse_dim(w); }
        if let Some(h) = s.get("minHeight") { style.min_size.height = parse_dim(h); }
        if let Some(w) = s.get("maxWidth") { style.max_size.width = parse_dim(w); }
        if let Some(h) = s.get("maxHeight") { style.max_size.height = parse_dim(h); }

        // Position Type & Insets (Batch 24.3: Absolute Constraint Resolver)
        // Check both CSS 'position' and OMNIOS 'layout_mode'
        let is_absolute = s.get("position").and_then(|v| v.as_str()) == Some("absolute") 
            || element.layout_mode.as_deref() == Some("freedom");

        if is_absolute {
            style.position = Position::Absolute;
            if let Some(l) = s.get("left") { style.inset.left = parse_len_auto(l); }
            if let Some(r) = s.get("right") { style.inset.right = parse_len_auto(r); }
            if let Some(t) = s.get("top") { style.inset.top = parse_len_auto(t); }
            if let Some(b) = s.get("bottom") { style.inset.bottom = parse_len_auto(b); }
        }

        // Padding
        if let Some(p) = s.get("padding") { 
            let val = parse_len(p);
            style.padding = Rect { left: val, right: val, top: val, bottom: val };
        }
        
        // Margin
        if let Some(m) = s.get("margin") { 
            let val = parse_len_auto(m);
            style.margin = Rect { left: val, right: val, top: val, bottom: val };
        }
        
        // Gap
        if let Some(g) = s.get("gap") {
            let val = parse_len(g);
            style.gap = Size { width: val, height: val };
        }
    }
    
    style
}

fn parse_dim(v: &serde_json::Value) -> Dimension {
    if let Some(s) = v.as_str() {
        if s.ends_with("%") {
            if let Ok(f) = s.trim_end_matches("%").parse::<f32>() {
                return Dimension::Percent(f / 100.0);
            }
        } else if s.ends_with("px") {
            if let Ok(f) = s.trim_end_matches("px").parse::<f32>() {
                return Dimension::Points(f);
            }
        } else if s == "auto" {
            return Dimension::Auto;
        }
    } else if let Some(n) = v.as_f64() {
        return Dimension::Points(n as f32);
    }
    Dimension::Auto
}

fn parse_len_auto(v: &serde_json::Value) -> LengthPercentageAuto {
    if let Some(s) = v.as_str() {
        if s == "auto" {
            return LengthPercentageAuto::Auto;
        } else if s.ends_with("%") {
            if let Ok(f) = s.trim_end_matches("%").parse::<f32>() {
                return LengthPercentageAuto::Percent(f / 100.0);
            }
        } else if s.ends_with("px") {
            if let Ok(f) = s.trim_end_matches("px").parse::<f32>() {
                return LengthPercentageAuto::Points(f);
            }
        }
    } else if let Some(n) = v.as_f64() {
        return LengthPercentageAuto::Points(n as f32);
    }
    LengthPercentageAuto::Auto
}

fn parse_len(v: &serde_json::Value) -> LengthPercentage {
    if let Some(s) = v.as_str() {
        if s.ends_with("%") {
            if let Ok(f) = s.trim_end_matches("%").parse::<f32>() {
                return LengthPercentage::Percent(f / 100.0);
            }
        } else if s.ends_with("px") {
            if let Ok(f) = s.trim_end_matches("px").parse::<f32>() {
                return LengthPercentage::Points(f);
            }
        }
    } else if let Some(n) = v.as_f64() {
        return LengthPercentage::Points(n as f32);
    }
    LengthPercentage::Points(0.0)
}
