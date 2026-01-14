use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use crate::ProjectState;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AriaRole {
    Button,
    Heading,
    Img,
    Group,
    Text,
    Link,
    Input,
    Dialog, // Added for Focus Trap context
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct A11yNode {
    pub id: String,
    pub role: AriaRole,
    pub label: Option<String>,
    pub description: Option<String>,
    pub children: Vec<A11yNode>,
    pub layout_id: String,
    pub focus_trap: bool, // NEW: Focus Management
}

pub struct TreeGenerator;

impl TreeGenerator {
    pub fn generate(state: &ProjectState, active_page_id: Option<&str>) -> Result<String, String> {
        let root_id = "root"; 
        
        if let Some(_) = state.elements.get(root_id) {
             let root_node = Self::build_node(root_id, state);
             Ok(serde_json::to_string_pretty(&root_node).unwrap_or_default())
        } else {
             Err("Root element not found".to_string())
        }
    }

    fn build_node(id: &str, state: &ProjectState) -> A11yNode {
        let el = &state.elements[id];
        
        // 1. Roles & Focus Traps
        let (role, focus_trap) = match el.r#type.as_str() {
            "button" => (AriaRole::Button, false),
            "modal" | "dialog" => (AriaRole::Dialog, true), // Intelligent Focus Trap
            "text" => (AriaRole::Text, false),
            "image" => (AriaRole::Img, false),
            "input" => (AriaRole::Input, false),
            _ => (AriaRole::Group, false),
        };

        // 2. Build Children first (needed for smart labelling)
        let mut children = Vec::new();
        let mut child_text_content = String::new();

        if let Some(child_ids) = &el.children {
            for child_id in child_ids {
                if state.elements.contains_key(child_id) {
                    let child_node = Self::build_node(child_id, state);
                    
                    // Accumulate text from text nodes for parent labeling
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

        // 3. Smart Labeling
        let label = if let Some(l) = Self::derive_label(el, state) {
            Some(l)
        } else if role == AriaRole::Button && !child_text_content.is_empty() {
             // If button has no explicit label but has text children, use that
             Some(child_text_content.trim().to_string())
        } else {
             None
        };

        A11yNode {
            id: format!("a11y_{}", id),
            role,
            label,
            description: None,
            children,
            layout_id: id.to_string(),
            focus_trap,
        }
    }

    fn derive_label(el: &crate::DesignerElement, _state: &ProjectState) -> Option<String> {
        // In full impl, check 'aria-label' prop or alt text
        if el.r#type == "image" {
             return Some("Image".to_string()); // Placeholder for alt property
        }
        if el.r#type == "text" {
            // Placeholder: In real engine, we'd read el.content
            return Some("Content".to_string()); 
        }
        None
    }
}
