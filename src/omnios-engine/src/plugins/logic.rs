use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// --- Plugin 1: StateMachinePlugin (Finite State Machine) ---
// Manages states like "Idle", "Loading", "Error" for logic flows.
pub struct StateMachinePlugin {
    pub current_state: Arc<Mutex<String>>,
    pub transitions: Arc<Mutex<HashMap<(String, String), String>>>, // (From, Event) -> To
}

impl StateMachinePlugin {
    pub fn new(initial: &str) -> Self {
        Self {
            current_state: Arc::new(Mutex::new(initial.to_string())),
            transitions: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    pub fn add_transition(&self, from: &str, event: &str, to: &str) {
        self.transitions.lock().unwrap().insert(
            (from.to_string(), event.to_string()), 
            to.to_string()
        );
    }
    
    pub fn trigger(&self, event: &str) -> bool {
        let mut state = self.current_state.lock().unwrap();
        let key = (state.clone(), event.to_string());
        
        if let Some(next) = self.transitions.lock().unwrap().get(&key) {
            *state = next.clone();
            true
        } else {
            false
        }
    }
}

impl OmniosPlugin for StateMachinePlugin {
    fn name(&self) -> &str { "StateMachinePlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}

// --- Plugin 2: BehaviorTreePlugin (Simple AI) ---
// Nodes return: Success, Failure, Running
#[derive(PartialEq, Debug)]
pub enum Status { Success, Failure, Running }

pub trait Node: Send + Sync {
    fn tick(&self) -> Status;
}

pub struct Sequence { pub children: Vec<Box<dyn Node>> }
impl Node for Sequence {
    fn tick(&self) -> Status {
        for child in &self.children {
            match child.tick() {
                Status::Failure => return Status::Failure,
                Status::Running => return Status::Running,
                Status::Success => continue,
            }
        }
        Status::Success
    }
}

pub struct Action { pub name: String, pub result: Status }
impl Node for Action {
    fn tick(&self) -> Status { 
        // In real app, perform logic here
        match self.result {
             Status::Success => Status::Success,
             _ => Status::Failure,
        }
    }
}

pub struct BehaviorTreePlugin {
    pub root: Option<Box<dyn Node>>,
}

impl BehaviorTreePlugin {
    pub fn new() -> Self { Self { root: None } }
    pub fn set_root(&mut self, node: Box<dyn Node>) { self.root = Some(node); }
    pub fn tick(&self) -> Option<Status> {
        self.root.as_ref().map(|n| n.tick())
    }
}

impl OmniosPlugin for BehaviorTreePlugin {
    fn name(&self) -> &str { "BehaviorTreePlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
    fn render(&self, _ctx: &RenderContext) { self.tick(); }
}
