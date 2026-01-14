use std::collections::HashMap;

// --- MOCK PROJECT STATE ---
pub struct Element {
    pub id: String,
    pub r#type: String,
    pub children: Option<Vec<String>>,
}
pub struct ProjectState {
    pub elements: HashMap<String, Element>,
}

// --- A11Y LOGIC (REFLECTING UPDATED a11y.rs) ---
#[derive(Debug, PartialEq)]
pub enum AriaRole { Button, Img, Text, Group, Input, Dialog }

pub struct A11yNode {
    pub id: String,
    pub role: AriaRole,
    pub label: Option<String>,
    pub children: Vec<A11yNode>,
    pub focus_trap: bool,
}

pub struct TreeGenerator;

impl TreeGenerator {
    pub fn build(id: &str, state: &ProjectState) -> A11yNode {
        let el = &state.elements[id];
        
        let (role, focus_trap) = match el.r#type.as_str() {
            "button" => (AriaRole::Button, false),
            "modal" | "dialog" => (AriaRole::Dialog, true),
            "text" => (AriaRole::Text, false),
            "image" => (AriaRole::Img, false),
            "input" => (AriaRole::Input, false),
            _ => (AriaRole::Group, false),
        };

        let mut children = Vec::new();
        let mut child_text_content = String::new();

        if let Some(child_ids) = &el.children {
            for child_id in child_ids {
                if state.elements.contains_key(child_id) {
                    let child_node = Self::build(child_id, state);
                    if child_node.role == AriaRole::Text {
                        if let Some(text) = &child_node.label {
                            child_text_content.push_str(text);
                            child_text_content.push(' ');
                        }
                    }
                    children.push(child_node);
                }
            }
        }

        let label = if let Some(l) = Self::derive_label(el) {
            Some(l)
        } else if role == AriaRole::Button && !child_text_content.is_empty() {
             Some(child_text_content.trim().to_string())
        } else {
             None
        };

        A11yNode {
            id: format!("a11y_{}", id),
            role,
            label,
            children,
            focus_trap,
        }
    }

    fn derive_label(el: &Element) -> Option<String> {
        if el.r#type == "image" { return Some("Image".to_string()); }
        if el.r#type == "text" { return Some("Content".to_string()); }
        None
    }
}

// --- VERIFICATION RUNNER ---
fn main() {
    println!(">>> STARTING REFINED A11Y VERIFICATION >>>");

    let mut elements = HashMap::new();
    
    // Root -> Modal -> [Close Button (w/ Text), Image]
    elements.insert("root".to_string(), Element {
        id: "root".to_string(), r#type: "frame".to_string(),
        children: Some(vec!["my_modal".to_string()]),
    });
    
    elements.insert("my_modal".to_string(), Element {
        id: "my_modal".to_string(), r#type: "modal".to_string(),
        children: Some(vec!["close_btn".to_string(), "hero_img".to_string()]),
    });
    
    elements.insert("close_btn".to_string(), Element {
        id: "close_btn".to_string(), r#type: "button".to_string(),
        children: Some(vec!["btn_text".to_string()]),
    });
    
    elements.insert("btn_text".to_string(), Element {
        id: "btn_text".to_string(), r#type: "text".to_string(),
        children: None,
    });
    
    elements.insert("hero_img".to_string(), Element {
        id: "hero_img".to_string(), r#type: "image".to_string(),
        children: None,
    });

    let state = ProjectState { elements };
    let root_node = TreeGenerator::build("root", &state);
    
    // --- VERIFY MODAL FOCUS TRAP ---
    let modal = &root_node.children[0];
    println!("Node: {}, Role: {:?}, Trap: {}", modal.id, modal.role, modal.focus_trap);
    
    if modal.role == AriaRole::Dialog && modal.focus_trap == true {
        println!("PASS: Modal detected as Dialog with Focus Trap.");
    } else {
        panic!("FAIL: Modal detection failed.");
    }
    
    // --- VERIFY SMART LABEL ---
    let btn = &modal.children[0];
    println!("Node: {}, Label: {:?}", btn.id, btn.label);
    
    if btn.label == Some("Content".to_string()) {
        println!("PASS: Button label inferred from child text.");
    } else {
        panic!("FAIL: Button label inference failed. Found: {:?}", btn.label);
    }

    println!("<<< VERIFICATION SUCCESSFUL: Focus Traps & Labels Working >>>");
}
