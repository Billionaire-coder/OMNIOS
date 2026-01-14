use wasm_bindgen::prelude::*;
use crate::sdk::OmniosPlugin;
#[cfg(feature = "browser")]
use web_sys::{console, Window, Document, HtmlCanvasElement, CanvasRenderingContext2d};
use taffy::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Mutex;

#[macro_use]
extern crate lazy_static;

pub mod collab; 
pub mod optimizer;
pub mod assets;
pub mod fonts;
pub mod sdk;
pub mod plugins;
pub mod vqa;
pub mod a11y;
pub mod neural;
pub mod healing;
pub mod native;
pub mod runtime;
pub mod core;
pub mod autonomous;




#[wasm_bindgen]
pub fn optimize_asset_image(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
   assets::ImageProcessor::process(data, width, height)
       .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn analyze_font_coverage(font_data: &[u8], text: &str) -> Result<String, JsValue> {
    fonts::FontAnalyzer::list_missing_glyphs(font_data, text)
        .map_err(|e| JsValue::from_str(&e))
}

// --- RUST REPLICAS OF DESIGNER TYPES ---

pub type ElementStyles = HashMap<String, serde_json::Value>;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DesignerElement {
    pub id: String,
    pub r#type: String,
    pub parent_id: Option<String>,
    pub children: Option<Vec<String>>,
    pub styles: Option<ElementStyles>,
    pub tablet_styles: Option<ElementStyles>,
    pub mobile_styles: Option<ElementStyles>,
    pub layout_mode: Option<String>,
    pub blueprint_id: Option<String>,
    pub variable_bindings: Option<HashMap<String, String>>,
    pub name: Option<String>,
    pub content: Option<String>,
    #[serde(flatten)]
    pub props: HashMap<String, serde_json::Value>,
}

// --- LOGIC SYSTEM ---

pub use plugins::logic_kernel::{UnifiedNode, UnifiedConnection, UnifiedBlueprint};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LogicVariable {
    pub id: String,
    pub name: String,
    pub r#type: String,
    pub value: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectState {
    pub name: String,
    pub elements: HashMap<String, DesignerElement>,
    pub blueprints: HashMap<String, UnifiedBlueprint>,
    pub global_variables: HashMap<String, LogicVariable>,
    pub active_page_id: Option<String>,
    pub view_mode: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnimationValue {
    pub current: f32,
    pub target: f32,
    pub velocity: f32,
}

// --- GLOBAL STATE ---

lazy_static! {
    static ref PROJECT_STATE: Mutex<Option<ProjectState>> = Mutex::new(None);
    static ref LAYOUT_TREE: Mutex<HashMap<String, Node>> = Mutex::new(HashMap::new());
    pub static ref TAFFY: Mutex<Taffy> = Mutex::new(Taffy::new());
    static ref ANIMATION_STATE: Mutex<HashMap<String, HashMap<String, AnimationValue>>> = Mutex::new(HashMap::new());
    static ref PLUGIN_REGISTRY: Mutex<sdk::PluginRegistry> = Mutex::new({
        let mut reg = sdk::PluginRegistry::new();
        // Register Standard Library
        reg.register(plugins::standard::create_gravity_plugin());
        // reg.register(plugins::standard::create_snow_plugin()); // Replaced by ParticlesPlugin
        reg
    });
    static ref PHYSICS_ENGINE: Mutex<plugins::physics::RigidBodyPlugin> = Mutex::new(plugins::physics::RigidBodyPlugin::new());
    static ref PARTICLES_ENGINE: Mutex<plugins::visuals::ParticlesPlugin> = Mutex::new(plugins::visuals::ParticlesPlugin::new());
    static ref STATEMACHINE_ENGINE: Mutex<plugins::logic::StateMachinePlugin> = Mutex::new(plugins::logic::StateMachinePlugin::new("Idle"));
    static ref DIRTY_ELEMENTS: Mutex<HashSet<String>> = Mutex::new(HashSet::new());
    static ref LOGIC_KERNEL: Mutex<plugins::logic_kernel::LogicKernel> = Mutex::new(plugins::logic_kernel::LogicKernel::new());
}

pub use plugins::spatial_index::{update_element_bounds, remove_element_bounds, hit_test, clear_spatial_index, SPATIAL_INDEX, get_element_bounds};

#[wasm_bindgen]
pub fn sync_state(json_state: &str) -> Result<(), JsValue> {
    let state: ProjectState = serde_json::from_str(json_state)
        .map_err(|e| JsValue::from_str(&format!("Serde Error: {}", e)))?;
    
    let mut global_state = PROJECT_STATE.lock().unwrap();
    *global_state = Some(state);
    
    // Trigger layout rebuild automatically on sync
    // Real implementation: Compute layout using Taffy and update Spatial Index
    let _ = compute_layout();
    // rebuild_spatial_index(); // Deprecated

    // Batch 9.1.5: Sync Physics World
    if let Some(s) = &*global_state {
        sync_physics_world(s);
    }
    
    // Batch 11.1: Register blueprints in Logic Kernel
    if let Some(s) = &*global_state {
        let mut kernel = LOGIC_KERNEL.lock().unwrap();
        for bp in s.blueprints.values() {
            kernel.register_blueprint(bp.clone());
        }
    }

    Ok(())
}

// fn rebuild_spatial_index() {
//    // Moved to plugins::layout::compute_project_layout
// }

fn sync_physics_world(state: &ProjectState) {
    let physics = PHYSICS_ENGINE.lock().unwrap();
    physics.clear();

    for (id, el) in &state.elements {
        // Simple heuristic: If it has "physics" style or specific metadata, add it.
        // For MVP, lets assume anything with "layoutMode: freedom" is a physics body 
        // OR we strictly look for a "physics" prop in styles (which we need to add to ElementStyles struct?).
        // For now, let's just make EVERYTHING a static body unless it has a specific flag, 
        // to prevent falling through floor.
        
        // Actually, let's only add things that requested physics.
        // We'll check `variable_bindings` for a "physics" key for now as a hack, 
        // or just add strict logical check:
        // if el.styles.position == "absolute" -> Dynamic?
        
        // BETTER: Check if we have a floor.
        // Let's add a floor by default.
        // physics.add_body("floor", 0.0, 500.0, true);

        // Real logic:
        // 1. Get x/y from layout (Taffy) or styles
        // 2. Add to physics
        
        // We need Taffy layout first? verify compute_layout was called.
        // But compute_layout runs on the static structure.
        
        // Let's use the style coordinates if absolute.
        let x = el.styles.as_ref()
            .and_then(|s| s.get("left"))
            .and_then(|v| v.as_str())
            .and_then(|s| s.trim_end_matches("px").parse::<f32>().ok())
            .unwrap_or(0.0);
            
        let y = el.styles.as_ref()
            .and_then(|s| s.get("top"))
            .and_then(|v| v.as_str())
            .and_then(|s| s.trim_end_matches("px").parse::<f32>().ok())
            .unwrap_or(0.0);
        
        // If it has a specific ID prefix "phys_" or binding, make it dynamic.
        let is_dynamic = id.contains("phys_"); 
        
        if is_dynamic {
             physics.add_body(id, x, y, false);
        } else {
             // Static colliders?
             // physics.add_body(id, x, y, true);
        }
    }
    
    // Always add a floor for demo
    physics.add_body("floor", 0.0, 500.0, true);
}

#[wasm_bindgen]
pub fn sync_element(val: JsValue) {
    let mut global_state = PROJECT_STATE.lock().unwrap();
    match serde_wasm_bindgen::from_value::<DesignerElement>(val) {
        Ok(el) => {
            if let Some(state) = global_state.as_mut() {
                state.elements.insert(el.id.clone(), el);
            }
            // Invalidate layout?
            // Trigger layout rebuild automatically on sync
            let _ = compute_layout();
        },
        Err(e) => web_sys::console::error_1(&format!("Element Sync Error: {:?}", e).into()),
    }
}

#[wasm_bindgen]
pub fn compute_layout() -> Result<String, JsValue> {
    let state_lock = PROJECT_STATE.lock().unwrap();
    let state = match &*state_lock {
        Some(s) => s,
        None => return Err("No state available".into()),
    };

    let mut taffy = TAFFY.lock().unwrap();
    let mut tree_map = LAYOUT_TREE.lock().unwrap();
    
    taffy.clear();
    tree_map.clear();

    // Start from root
    let root_id = "root";
    if state.elements.contains_key(root_id) {
        let root_node = build_node(root_id, state, &mut taffy, &mut tree_map);
        taffy.compute_layout(root_node, Size::MAX_CONTENT).unwrap();
    }

    // NEW: Sync animation targets after layout computation
    update_animation_targets_internal(&taffy, &tree_map);

    // NEW: Batch 24.3 - Update Spatial Index with Absolute Coordinates
    update_spatial_index_internal(&taffy, &tree_map);

    Ok("Layout Computed".into())
}

fn update_spatial_index_internal(taffy: &Taffy, tree_map: &HashMap<String, Node>) {
    let mut index = SPATIAL_INDEX.lock().unwrap();
    index.clear();

    for (id, node) in tree_map.iter() {
        if let Ok(layout) = taffy.layout(*node) {
             let (x, y) = get_absolute_position_internal(taffy, *node);
             index.insert_or_update(
                id.clone(),
                x,
                y,
                layout.size.width,
                layout.size.height
            );
        }
    }
}

fn get_absolute_position_internal(taffy: &Taffy, node: Node) -> (f32, f32) {
    let mut x = 0.0;
    let mut y = 0.0;
    
    if let Ok(layout) = taffy.layout(node) {
        x = layout.location.x;
        y = layout.location.y;
        
        let mut current = node;
        while let Some(parent) = taffy.parent(current) {
            if let Ok(parent_layout) = taffy.layout(parent) {
                x += parent_layout.location.x;
                y += parent_layout.location.y;
            }
            current = parent;
        }
    }
    
    (x, y)
}

fn update_animation_targets_internal(taffy: &Taffy, tree_map: &HashMap<String, Node>) {
    let mut anim_state = ANIMATION_STATE.lock().unwrap();

    for (id, node) in tree_map.iter() {
        let layout = taffy.layout(*node).unwrap();
        let target_x = layout.location.x;
        let target_y = layout.location.y;
        let target_w = layout.size.width;
        let target_h = layout.size.height;

        let props = anim_state.entry(id.clone()).or_insert_with(|| HashMap::new());
        
        let update_prop = |props: &mut HashMap<String, AnimationValue>, key: &str, target: f32| {
            let val = props.entry(key.to_string()).or_insert(AnimationValue {
                current: target, target, velocity: 0.0
            });
            val.target = target;
        };

        update_prop(props, "x", target_x);
        update_prop(props, "y", target_y);
        update_prop(props, "width", target_w);
        update_prop(props, "height", target_h);
    }
}

#[wasm_bindgen]
pub fn update_animations(dt: f32) {
    let mut anim_state = ANIMATION_STATE.lock().unwrap();
    // Neutral Spring (matches framer-motion defaults roughly)
    let stiffness = 170.0;
    let damping = 26.0;
    let mass = 1.0;

    for props in anim_state.values_mut() {
        for val in props.values_mut() {
            // Spring equation: F = -kx - cv
            let force = -stiffness * (val.current - val.target);
            let damping_force = -damping * val.velocity;
            let acceleration = (force + damping_force) / mass;
            
            val.velocity += acceleration * dt;
            val.current += val.velocity * dt;
        }
    }

    // --- PLUGIN RENDER HOOK ---
    // We treat update_animations as the "frame" for now for visual effects
    let state_lock = PROJECT_STATE.lock().unwrap();
    if let Some(_) = &*state_lock {
         // In a real engine we'd get canvas dimensions. Partial mock for now.
         // We use static counter for frame_count
         static mut FRAME_COUNTER: u64 = 0;
         unsafe { FRAME_COUNTER += 1; }
         
         let ctx = sdk::RenderContext {
             width: 1920.0,
             height: 1080.0,
             frame_count: unsafe { FRAME_COUNTER },
         };
         
         let registry = PLUGIN_REGISTRY.lock().unwrap();
         registry.render_all(&ctx);
         
         // Batch 9.1: Run Physics Step
         let physics = PHYSICS_ENGINE.lock().unwrap();
         physics.render(&ctx);

         // Batch 9.2: Run Particles Step
         let particles = PARTICLES_ENGINE.lock().unwrap();
         particles.render(&ctx);
    }
}

fn build_node(
    id: &str, 
    state: &ProjectState, 
    taffy: &mut Taffy, 
    tree_map: &mut HashMap<String, Node>
) -> Node {
    let el = &state.elements[id];
    let mut style = Style::default();

    // Determine active styles based on view_mode
    let mut final_styles = el.styles.clone().unwrap_or(HashMap::new());

    if state.view_mode == "tablet" {
        if let Some(ts) = &el.tablet_styles {
             for (k, v) in ts {
                 final_styles.insert(k.clone(), v.clone());
             }
        }
    } else if state.view_mode == "mobile" {
        if let Some(ms) = &el.mobile_styles {
             for (k, v) in ms {
                 final_styles.insert(k.clone(), v.clone());
             }
        }
    }

    // Map Final Styles to Taffy Style
    let s = &final_styles;
    
    // Helper to get string value for enums (Display, etc)
    let get_str = |key: &str| s.get(key).and_then(|v| v.as_str());
    // Helper to get value reference for Dimensions
    let get_val = |key: &str| s.get(key);

    // Display
    match get_str("display") {
        Some("flex") => style.display = Display::Flex,
        Some("grid") => style.display = Display::Grid,
        Some("none") => style.display = Display::None,
        _ => style.display = Display::Flex, // Default
    }

    // Flex Direction
    match get_str("flexDirection") {
        Some("column") => style.flex_direction = FlexDirection::Column,
        Some("row-reverse") => style.flex_direction = FlexDirection::RowReverse,
        Some("column-reverse") => style.flex_direction = FlexDirection::ColumnReverse,
        _ => style.flex_direction = FlexDirection::Row,
    }

    // Justify Content
    if let Some(jc) = get_str("justifyContent") {
        style.justify_content = match jc {
            "flex-start" | "start" => Some(JustifyContent::Start),
            "flex-end" | "end" => Some(JustifyContent::End),
            "center" => Some(JustifyContent::Center),
            "space-between" => Some(JustifyContent::SpaceBetween),
            "space-around" => Some(JustifyContent::SpaceAround),
            _ => None,
        };
    }

    // Align Items
    if let Some(ai) = get_str("alignItems") {
        style.align_items = match ai {
            "flex-start" | "start" => Some(AlignItems::Start),
            "flex-end" | "end" => Some(AlignItems::End),
            "center" => Some(AlignItems::Center),
            "baseline" => Some(AlignItems::Baseline),
            "stretch" => Some(AlignItems::Stretch),
            _ => None,
        };
    }

    // Gap
    if let Some(g) = get_val("gap") {
        let val = parse_length_percentage(g);
        style.gap = Size { width: val, height: val };
    }

    // Sizing
    if let Some(w) = get_val("width") { style.size.width = parse_dimension(w); }
    if let Some(h) = get_val("height") { style.size.height = parse_dimension(h); }
    if let Some(w) = get_val("minWidth") { style.min_size.width = parse_dimension(w); }
    if let Some(h) = get_val("minHeight") { style.min_size.height = parse_dimension(h); }
    if let Some(w) = get_val("maxWidth") { style.max_size.width = parse_dimension(w); }
    if let Some(h) = get_val("maxHeight") { style.max_size.height = parse_dimension(h); }

    // Position (Freedom mode support)
    if get_str("position") == Some("absolute") || el.layout_mode.as_deref() == Some("freedom") {
        style.position = Position::Absolute;
        if let Some(l) = get_val("left") { style.inset.left = parse_length_percentage_auto(l); }
        if let Some(t) = get_val("top") { style.inset.top = parse_length_percentage_auto(t); }
        if let Some(r) = get_val("right") { style.inset.right = parse_length_percentage_auto(r); }
        if let Some(b) = get_val("bottom") { style.inset.bottom = parse_length_percentage_auto(b); }
    }

    // Padding & Margin (Simplified for MVP)
    if let Some(p) = get_val("padding") {
        let val = parse_length_percentage(p);
        style.padding = Rect { left: val, right: val, top: val, bottom: val };
    }


    // Recursively build children
    let mut child_nodes = Vec::new();
    if let Some(children_ids) = &el.children {
        for child_id in children_ids {
            if state.elements.contains_key(child_id) {
                child_nodes.push(build_node(child_id, state, taffy, tree_map));
            }
        }
    }

    let node = taffy.new_with_children(style, &child_nodes).unwrap();
    tree_map.insert(id.to_string(), node);
    node
}

fn parse_dimension(v: &serde_json::Value) -> taffy::style::Dimension {
    if let Some(dim) = v.as_str() {
        if dim == "auto" {
            taffy::style::Dimension::Auto
        } else if dim.ends_with("px") {
            let val = dim.trim_end_matches("px").parse::<f32>().unwrap_or(0.0);
            taffy::style::Dimension::Points(val)
        } else if dim.ends_with("%") {
            let val = dim.trim_end_matches("%").parse::<f32>().unwrap_or(0.0) / 100.0;
            taffy::style::Dimension::Percent(val)
        } else {
            if let Ok(val) = dim.parse::<f32>() {
                taffy::style::Dimension::Points(val)
            } else {
                taffy::style::Dimension::Auto
            }
        }
    } else if let Some(n) = v.as_f64() {
        taffy::style::Dimension::Points(n as f32)
    } else {
        taffy::style::Dimension::Auto
    }
}

fn parse_length_percentage_auto(v: &serde_json::Value) -> taffy::style::LengthPercentageAuto {
    if let Some(dim) = v.as_str() {
        if dim == "auto" {
            taffy::style::LengthPercentageAuto::Auto
        } else if dim.ends_with("px") {
            let val = dim.trim_end_matches("px").parse::<f32>().unwrap_or(0.0);
            taffy::style::LengthPercentageAuto::Points(val)
        } else if dim.ends_with("%") {
            let val = dim.trim_end_matches("%").parse::<f32>().unwrap_or(0.0) / 100.0;
            taffy::style::LengthPercentageAuto::Percent(val)
        } else {
            if let Ok(val) = dim.parse::<f32>() {
                taffy::style::LengthPercentageAuto::Points(val)
            } else {
                taffy::style::LengthPercentageAuto::Auto
            }
        }
    } else if let Some(n) = v.as_f64() {
        taffy::style::LengthPercentageAuto::Points(n as f32)
    } else {
        taffy::style::LengthPercentageAuto::Auto
    }
}

fn parse_length_percentage(v: &serde_json::Value) -> taffy::style::LengthPercentage {
    if let Some(dim) = v.as_str() {
        if dim.ends_with("%") {
            let val = dim.trim_end_matches("%").parse::<f32>().unwrap_or(0.0) / 100.0;
            taffy::style::LengthPercentage::Percent(val)
        } else {
            let val = dim.trim_end_matches("px").parse::<f32>().unwrap_or(0.0);
            taffy::style::LengthPercentage::Points(val)
        }
    } else if let Some(n) = v.as_f64() {
        taffy::style::LengthPercentage::Points(n as f32)
    } else {
        taffy::style::LengthPercentage::Points(0.0)
    }
}

#[wasm_bindgen]
pub fn get_element_layout(id: &str) -> JsValue {
    let anim_state = ANIMATION_STATE.lock().unwrap();
    
    // Check if we have active animations for this element
    if let Some(props) = anim_state.get(id) {
        let x = props.get("x").map(|v| v.current).unwrap_or(0.0);
        let y = props.get("y").map(|v| v.current).unwrap_or(0.0);
        let w = props.get("width").map(|v| v.current).unwrap_or(0.0);
        let h = props.get("height").map(|v| v.current).unwrap_or(0.0);

        let map = HashMap::from([
            ("x", x),
            ("y", y),
            ("width", w),
            ("height", h),
        ]);
        return serde_json::to_string(&map).unwrap().into();
    }

    // Fallback to static layout if no animation state
    let taffy = TAFFY.lock().unwrap();
    let tree_map = LAYOUT_TREE.lock().unwrap();
    
    if let Some(node) = tree_map.get(id) {
        let layout = taffy.layout(*node).unwrap();
        let map = HashMap::from([
            ("x", layout.location.x),
            ("y", layout.location.y),
            ("width", layout.size.width),
            ("height", layout.size.height),
        ]);
        return serde_json::to_string(&map).unwrap().into();
    }
    JsValue::NULL
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = "triggerSideEffect")]
    fn trigger_side_effect(action_type: &str, payload: &str);
}

#[wasm_bindgen]
pub fn fire_trigger(blueprint_id: &str, trigger_type: &str, payload_json: &str) -> Result<(), JsValue> {
    let payload: serde_json::Value = serde_json::from_str(payload_json)
        .unwrap_or(serde_json::Value::Null);
    
    LOGIC_KERNEL.lock().unwrap().execute(blueprint_id, trigger_type, &payload);
    Ok(())
}

// execute_flow removed

#[cfg(feature = "browser")]
#[wasm_bindgen]
pub fn start_engine(canvas_id: &str) -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let canvas_el = document.get_element_by_id(canvas_id).expect("canvas not found");
    let canvas: HtmlCanvasElement = canvas_el.dyn_into::<HtmlCanvasElement>().map_err(|_| "not a canvas")?;
    let context = canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?;

    context.set_fill_style_str("#111");
    context.fill_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

    context.set_fill_style_str("#00FF00");
    context.set_font("20px Inter");
    context.fill_text("Hyper-Engine Core Online.", 50.0, 50.0)?;

    Ok(())
}

#[wasm_bindgen]
pub fn run_benchmark(canvas_id: &str, node_count: usize) -> Result<String, JsValue> {
    // Keeping benchmark for performance testing
    #[cfg(feature = "browser")]
    let window = web_sys::window().expect("no global `window` exists");
    #[cfg(feature = "browser")]
    let performance = window.performance().expect("performance should be available");
    #[cfg(feature = "browser")]
    let document = window.document().expect("should have a document on window");
    #[cfg(feature = "browser")]
    let canvas_el = document.get_element_by_id(canvas_id).expect("canvas not found");
    #[cfg(feature = "browser")]
    let canvas: HtmlCanvasElement = canvas_el.dyn_into::<HtmlCanvasElement>().map_err(|_| "not a canvas")?;
    #[cfg(feature = "browser")]
    let context = canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?;

    #[cfg(feature = "browser")]
    context.set_fill_style_str("#111");
    #[cfg(feature = "browser")]
    context.fill_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

    #[cfg(feature = "browser")]
    // let start_layout = performance.now();
    let mut taffy = Taffy::new();

    let mut children = Vec::new();
    for _ in 0..node_count {
        let child = taffy.new_leaf(Style {
            size: Size { 
                width: taffy::style::Dimension::Points(10.0), 
                height: taffy::style::Dimension::Points(10.0) 
            },
            ..Default::default()
        }).unwrap();
        children.push(child);
    }

    let width_val = {
        #[cfg(feature = "browser")]
        { canvas.width() as f32 }
        #[cfg(not(feature = "browser"))]
        { 800.0 }
    };

    let root = taffy.new_with_children(
        Style {
            display: Display::Flex,
            flex_wrap: FlexWrap::Wrap,
            size: Size { width: taffy::style::Dimension::Points(width_val), height: taffy::style::Dimension::Auto },
            ..Default::default()
        },
        &children
    ).unwrap();

    taffy.compute_layout(root, Size { width: AvailableSpace::MaxContent, height: AvailableSpace::MaxContent }).unwrap();
    // #[cfg(feature = "browser")]
    // let end_layout = performance.now();

    #[cfg(feature = "browser")]
    context.set_fill_style_str("rgba(0, 255, 100, 0.5)");
    #[cfg(feature = "browser")]
    for child in children {
        let layout = taffy.layout(child).unwrap();
        context.fill_rect(layout.location.x as f64, layout.location.y as f64, layout.size.width as f64, layout.size.height as f64);
    }
    
    #[cfg(feature = "browser")]
    {
        // let end_render = performance.now();
        let msg = format!("OMNIOS Engine: Rendered {} nodes", node_count); // Simplified
        Ok(msg)
    }
    #[cfg(not(feature = "browser"))]
    {
        Ok(format!("OMNIOS Engine: Computed layout for {} nodes (Edge Mode)", node_count))
    }
}

#[wasm_bindgen]
pub fn get_optimization_report(blueprint_id: &str) -> Result<String, JsValue> {
    let state_lock = PROJECT_STATE.lock().unwrap();
    let state = match &*state_lock {
        Some(s) => s,
        None => return Err("No state available".into()),
    };
    
    let blueprint = state.blueprints.get(blueprint_id)
        .ok_or_else(|| JsValue::from_str(&format!("Blueprint {} not found", blueprint_id)))?;

    Ok(optimizer::BundleAnalyzer::analyze(blueprint))
}

#[wasm_bindgen]
pub fn capture_snapshot(blueprint_id: &str) -> Result<String, JsValue> {
    let taffy = TAFFY.lock().unwrap();
    let tree_map = LAYOUT_TREE.lock().unwrap();
    
    vqa::SnapshotGenerator::generate(blueprint_id, &taffy, &tree_map)
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn get_a11y_tree() -> Result<String, JsValue> {
    let state_lock = PROJECT_STATE.lock().unwrap();
    let state = match &*state_lock {
        Some(s) => s,
        None => return Err("No state available".into()),
    };

    a11y::TreeGenerator::generate(state, state.active_page_id.as_deref())
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn predict_interaction(element_id: &str, hover_ms: f32, velocity: f32) -> Result<String, JsValue> {
    let predictor = neural::NeuralPredictor::new();
    
    let mut features = HashMap::new();
    features.insert("hover_duration".to_string(), hover_ms);
    features.insert("velocity_towards".to_string(), velocity);
    
    // In a real scenario, we'd query the predictor
    // predictor.predict(...)
    
    // Use the real predictor logic
    match predictor.predict_next_interaction(element_id, &features) {
        Some(prediction) => serde_json::to_string(&prediction).map_err(|e| JsValue::from_str(&format!("{}", e))),
        None => Ok("null".to_string())
    }
}

#[wasm_bindgen]
pub fn synthesize_placeholder(width: f32, height: f32, color_hex: &str) -> String {
    // Generate a complementary gradient based on the input color
    // Simple mock logic for the "AI" part of color matching
    let color_end = "#CCCCCC"; 
    healing::PlaceholderGenerator::synthesize(width, height, color_hex, color_end)
}

#[wasm_bindgen]
pub fn compile_native_bundle(project_name: &str, target_os: &str) -> Result<String, JsValue> {
    let bundle = native::NativeCompiler::compile_target(project_name, target_os);
    serde_json::to_string(&bundle).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

#[wasm_bindgen]
pub fn get_physics_state() -> Result<String, JsValue> {
    let physics = PHYSICS_ENGINE.lock().unwrap();
    let state = physics.get_state();
    serde_json::to_string(&state).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

#[wasm_bindgen]
pub fn get_batch_transforms() -> Vec<f32> {
    let physics = PHYSICS_ENGINE.lock().unwrap();
    physics.get_batch_transforms()
}

#[wasm_bindgen]
pub fn emit_particle(x: f32, y: f32, p_type: &str) {
    let mut engine = PARTICLES_ENGINE.lock().unwrap();
    let pt = match p_type {
        "fire" => plugins::visuals::ParticleType::Fire,
        "smoke" => plugins::visuals::ParticleType::Smoke,
        _ => plugins::visuals::ParticleType::Snow,
    };
    engine.emit(x, y, pt);
}

#[wasm_bindgen]
pub fn fire_state_trigger(event: &str) -> bool {
    let machine = STATEMACHINE_ENGINE.lock().unwrap();
    let res = machine.trigger(event);
    
    // Batch 9.3: Side Effect Demo
    // If the state changed, let's trigger a side effect on the JS side
    if res {
        trigger_side_effect("log", &format!("State Machine Transitioned to: {}", *machine.current_state.lock().unwrap()));
        
        // Mock Side Effect: If state became "Active", emit particles!
        if *machine.current_state.lock().unwrap() == "Active" {
             // We can call internal rust functions too
             let parts = PARTICLES_ENGINE.lock().unwrap();
             parts.emit(500.0, 500.0, plugins::visuals::ParticleType::Fire);
             // And tell JS
             trigger_side_effect("alert", "State Machine is now ACTIVE! Particles Emitted!");
        }
    }
    
    res
}

#[wasm_bindgen]
pub fn create_autonomous_experiment(id: &str, element_id: &str, variants_json: &str) -> Result<(), JsValue> {
    let variants: Vec<autonomous::Variant> = serde_json::from_str(variants_json)
        .map_err(|e| JsValue::from_str(&format!("Variant Parse Error: {}", e)))?;
    autonomous::AutonomousEngine::create_experiment(id, element_id, variants);
    Ok(())
}

#[wasm_bindgen]
pub fn select_autonomous_variant(experiment_id: &str) -> Result<String, JsValue> {
    let variant = autonomous::AutonomousEngine::select_variant(experiment_id)
        .ok_or_else(|| JsValue::from_str("Experiment not found"))?;
    serde_json::to_string(&variant).map_err(|e| JsValue::from_str(&format!("{}", e)))
}

#[wasm_bindgen]
pub fn record_experiment_outcome(experiment_id: &str, variant_id: &str, conversion: bool) {
    if conversion {
        autonomous::AutonomousEngine::record_conversion(experiment_id, variant_id);
    } else {
        autonomous::AutonomousEngine::record_impression(experiment_id, variant_id);
    }
}

#[wasm_bindgen]
pub fn fire_blueprint_trigger(blueprint_id: &str, trigger: &str, _payload: &str) -> bool {
    // Already implemented as fire_trigger at line 557
    #[cfg(feature = "browser")]
    web_sys::console::log_1(&format!("Blueprint Trigger: {} -> {}", blueprint_id, trigger).into());
    true
}

#[wasm_bindgen]
pub fn set_variable(id: &str, value_json: &str) -> bool {
    let mut state_guard = PROJECT_STATE.lock().unwrap();
    if let Some(state) = state_guard.as_mut() {
        if let Some(var) = state.global_variables.get_mut(id) {
            if let Ok(val) = serde_json::from_str(value_json) {
                var.value = val;
                return true;
            }
        }
    }
    false
}

#[wasm_bindgen]
pub fn get_variable(id: &str) -> String {
    let state_guard = PROJECT_STATE.lock().unwrap();
    if let Some(state) = state_guard.as_ref() {
        if let Some(var) = state.global_variables.get(id) {
            return var.value.to_string();
        }
    }
    "null".to_string()
}

// --- PHASE 10: HYPER COMMAND PROTOCOL ---

#[derive(Serialize, Deserialize, Debug)]
pub struct HyperCommand {
    pub id: String,
    pub action: String,
    pub target_id: String,
    pub payload: serde_json::Value,
    pub timestamp: u64,
}

#[wasm_bindgen]
pub fn apply_command(command_json: &str) -> bool {
    let cmd: HyperCommand = match serde_json::from_str(command_json) {
        Ok(c) => c,
        Err(_) => return false,
    };

    let mut state_guard = PROJECT_STATE.lock().unwrap();
    if state_guard.is_none() { return false; }
    let state = state_guard.as_mut().unwrap();

    match cmd.action.as_str() {
        "UPDATE_STYLE" => {
            if let Some(el) = state.elements.get_mut(&cmd.target_id) {
                let updates = &cmd.payload["updates"];
                let view_mode = cmd.payload["viewMode"].as_str().unwrap_or("desktop");

                let target_styles = match view_mode {
                    "mobile" => el.mobile_styles.get_or_insert_with(|| HashMap::new()),
                    "tablet" => el.tablet_styles.get_or_insert_with(|| HashMap::new()),
                    _ => el.styles.get_or_insert_with(|| HashMap::new()),
                };

                if let Some(obj) = updates.as_object() {
                    for (k, v) in obj {
                        target_styles.insert(k.clone(), v.clone());
                    }
                }
                
                // Track change for Batch 10.2
                DIRTY_ELEMENTS.lock().unwrap().insert(cmd.target_id.clone());
                
                return true;
            }
        },
        "UPDATE_PROP" => {
             if let Some(el) = state.elements.get_mut(&cmd.target_id) {
                let prop = cmd.payload["prop"].as_str().unwrap_or("");
                let value = &cmd.payload["value"];
                
                match prop {
                    "content" => el.content = Some(value.as_str().unwrap_or("").to_string()),
                    "name" => el.name = Some(value.as_str().unwrap_or("").to_string()),
                    "layoutMode" => el.layout_mode = Some(value.as_str().unwrap_or("safety").to_string()),
                    _ => {
                        el.props.insert(prop.to_string(), value.clone());
                    }
                }

                // Track change for Batch 10.2
                DIRTY_ELEMENTS.lock().unwrap().insert(cmd.target_id.clone());

                return true;
            }
        },
        "ADD_ELEMENT" => {
            if let Ok(element) = serde_json::from_value::<DesignerElement>(cmd.payload["element"].clone()) {
                let parent_id = cmd.payload["parentId"].as_str().unwrap_or("root").to_string();
                let index = cmd.payload["index"].as_u64().map(|v| v as usize);
                
                // 1. Insert into elements map
                state.elements.insert(element.id.clone(), element.clone());
                
                // Batch 9.1: Sync computed layout back to elements
                // This block is intended for a layout loop, but if we're adding an element,
                // we should ensure its initial bounds are set in the spatial index.
                // Assuming `element` here is the newly added one.
                let element_id = element.id.clone();
                if let Some(mut el) = state.elements.get_mut(&element_id) {
                    // Placeholder for initial layout properties if not already set
                    // In a real layout loop, these would come from a layout engine.
                    // For ADD_ELEMENT, we might initialize them or expect them to be set later.
                    let initial_x = el.props.get("layout_x").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
                    let initial_y = el.props.get("layout_y").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
                    let initial_width = el.props.get("layout_width").and_then(|v| v.as_f64()).unwrap_or(100.0) as f32;
                    let initial_height = el.props.get("layout_height").and_then(|v| v.as_f64()).unwrap_or(100.0) as f32;

                    // Batch 12.1: Populate Spatial Index for Hit Testing
                    let mut spatial_index = SPATIAL_INDEX.lock().unwrap();
                    spatial_index.insert_or_update(
                        element_id.clone(),
                        initial_x,
                        initial_y,
                        initial_width,
                        initial_height
                    );
                }
        
                // 2. Add to parent's children
                if let Some(parent) = state.elements.get_mut(&parent_id) {
                    let children = parent.children.get_or_insert_with(|| Vec::new());
                    if let Some(idx) = index {
                        if idx <= children.len() {
                            children.insert(idx, element.id.clone());
                        } else {
                            children.push(element.id.clone());
                        }
                    } else {
                        children.push(element.id.clone());
                    }
                }
                
                DIRTY_ELEMENTS.lock().unwrap().insert(parent_id);
                DIRTY_ELEMENTS.lock().unwrap().insert(element.id);
                return true;
            }
        },
        "REMOVE_ELEMENT" => {
            let id = cmd.target_id.clone();
            if let Some(element) = state.elements.remove(&id) {
                if let Some(parent_id) = &element.parent_id {
                    if let Some(parent) = state.elements.get_mut(parent_id) {
                        if let Some(children) = &mut parent.children {
                            children.retain(|c| c != &id);
                        }
                    }
                    DIRTY_ELEMENTS.lock().unwrap().insert(parent_id.clone());
                }
                return true;
            }
        },
        "REORDER_ELEMENT" => {
             let parent_id = cmd.payload["parentId"].as_str().unwrap_or("root").to_string();
             let element_id = cmd.target_id.clone();
             let new_index = cmd.payload["newIndex"].as_u64().unwrap_or(0) as usize;

             if let Some(parent) = state.elements.get_mut(&parent_id) {
                 if let Some(children) = &mut parent.children {
                     if let Some(old_index) = children.iter().position(|c| c == &element_id) {
                         children.remove(old_index);
                         let target_idx = if new_index > children.len() { children.len() } else { new_index };
                         children.insert(target_idx, element_id);
                         
                         DIRTY_ELEMENTS.lock().unwrap().insert(parent_id);
                         return true;
                     }
                 }
             }
        },
        _ => {
            #[cfg(feature = "browser")]
            web_sys::console::warn_1(&format!("Unknown command action: {}", cmd.action).into());
        }
    }

    false
}

#[wasm_bindgen]
pub fn get_state_deltas() -> String {
    let mut dirty = DIRTY_ELEMENTS.lock().unwrap();
    if dirty.is_empty() { return "[]".to_string(); }

    let state_lock = PROJECT_STATE.lock().unwrap();
    if state_lock.is_none() { 
        dirty.clear();
        return "[]".to_string(); 
    }
    let state = state_lock.as_ref().unwrap();

    let mut deltas = Vec::new();
    for id in dirty.iter() {
        if let Some(el) = state.elements.get(id) {
            deltas.push(el);
        }
    }

    dirty.clear();
    serde_json::to_string(&deltas).unwrap_or("[]".to_string())
}



#[wasm_bindgen]
pub fn register_logic_blueprint(json: &str) -> Result<(), JsValue> {
    let bp: plugins::logic_kernel::UnifiedBlueprint = serde_json::from_str(json)
        .map_err(|e| JsValue::from_str(&format!("Logic Parse Error: {}", e)))?;
    
    LOGIC_KERNEL.lock().unwrap().register_blueprint(bp);
    Ok(())
}

#[wasm_bindgen]
pub fn trigger_logic(blueprint_id: &str, trigger_type: &str, payload_json: &str) -> Result<(), JsValue> {
    let payload: serde_json::Value = serde_json::from_str(payload_json)
        .unwrap_or(serde_json::Value::Null);
    
    LOGIC_KERNEL.lock().unwrap().execute(blueprint_id, trigger_type, &payload);
    Ok(())
}

#[wasm_bindgen]
pub fn mutate_architectural_blueprint(snapshot: &str, strategy: &str) -> String {
    native::NativeCompiler::mutate_blueprint(snapshot, strategy)
}

#[wasm_bindgen]
pub fn constrain_drag(element_id: &str, target_x: f32, target_y: f32) -> Vec<f32> {
    let (x, y) = plugins::interaction::InteractionPlugin::constrain_drag(element_id, target_x, target_y);
    vec![x, y]
}

#[wasm_bindgen]
pub fn get_group_bounds(ids_json: &str) -> String {
    let ids: Vec<String> = serde_json::from_str(ids_json).unwrap_or(Vec::new());
    
    if let Some((x, y, w, h)) = plugins::interaction::InteractionPlugin::get_group_bounds(ids) {
        let map = HashMap::from([
             ("x", x),
             ("y", y),
             ("width", w),
             ("height", h)
        ]);
        return serde_json::to_string(&map).unwrap_or("{}".to_string());
    }
    
    "{}".to_string()
}

#[wasm_bindgen]
pub fn find_snap_targets(element_id: &str, x: f32, y: f32, width: f32, height: f32) -> String {
    let result = plugins::interaction::InteractionPlugin::find_snap_targets(element_id, x, y, width, height, 5.0);
    serde_json::to_string(&result).unwrap_or("{}".to_string())
}
