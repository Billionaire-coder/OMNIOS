use std::collections::HashMap;
use std::env;

/// SecretStore handles encrypted or env-var based secrets.
/// In Server Mode: Reads from Env Vars.
/// In Browser Mode: Uses mapped values passed safely (or proxies).
pub struct SecretStore {
    secrets: HashMap<String, String>,
}

impl SecretStore {
    pub fn new() -> Self {
        Self {
            secrets: HashMap::new(),
        }
    }

    /// Tries to resolve a secret.
    /// 1. Look in internal map.
    /// 2. Look in OS Environment (Server-Side specific).
    pub fn get(&self, key: &str) -> Option<String> {
        if let Some(val) = self.secrets.get(key) {
            return Some(val.clone());
        }

        // Feature flagged: Only access ENV on non-wasm targets or if feature enabled
        #[cfg(not(target_arch = "wasm32"))]
        {
            if let Ok(val) = env::var(key) {
                return Some(val);
            }
        }
        
        None
    }

    pub fn set(&mut self, key: &str, value: &str) {
        self.secrets.insert(key.to_string(), value.to_string());
    }
}
