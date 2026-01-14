use crate::sdk::{OmniosPlugin, PluginContext, RenderContext};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// --- Plugin 1: RestAPIPlugin (Declarative Fetcher) ---
// Binds endpoint URLs to data keys in the project state.
pub struct RestAPIPlugin {
    pub endpoints: Arc<Mutex<HashMap<String, String>>>, // "user_data" -> "https://api.user.com"
    pub cache: Arc<Mutex<HashMap<String, String>>>,      // "user_data" -> "{json}"
}

impl RestAPIPlugin {
    pub fn new() -> Self {
        Self {
            endpoints: Arc::new(Mutex::new(HashMap::new())),
            cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    pub fn register_endpoint(&self, key: &str, url: &str) {
        self.endpoints.lock().unwrap().insert(key.to_string(), url.to_string());
    }
    
    // Simulates a fetch completing and populating cache
    pub fn mock_fetch_complete(&self, key: &str, json_response: &str) {
        self.cache.lock().unwrap().insert(key.to_string(), json_response.to_string());
    }
}

impl OmniosPlugin for RestAPIPlugin {
    fn name(&self) -> &str { "RestAPIPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}

// --- Plugin 2: WebSocketPlugin (Realtime) ---
pub struct WebSocketPlugin {
    pub status: Arc<Mutex<String>>, // "Connected", "Disconnected"
    pub message_queue: Arc<Mutex<Vec<String>>>,
}

impl WebSocketPlugin {
    pub fn new() -> Self {
        Self {
            status: Arc::new(Mutex::new("Disconnected".to_string())),
            message_queue: Arc::new(Mutex::new(Vec::new())),
        }
    }
    
    pub fn connect(&self, _url: &str) {
        *self.status.lock().unwrap() = "Connected".to_string();
    }
    
    pub fn send(&self, msg: &str) {
        if *self.status.lock().unwrap() == "Connected" {
            self.message_queue.lock().unwrap().push(format!("OUT: {}", msg));
        }
    }
    
    pub fn receive_mock(&self, msg: &str) {
         self.message_queue.lock().unwrap().push(format!("IN: {}", msg));
    }
}

impl OmniosPlugin for WebSocketPlugin {
    fn name(&self) -> &str { "WebSocketPlugin" }
    fn on_register(&mut self, _context: &mut PluginContext) {}
}
