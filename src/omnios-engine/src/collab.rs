use wasm_bindgen::prelude::*;
use yrs::{Doc, StateVector, Transact, Update, ReadTxn}; // Added ReadTxn
use yrs::types::ToJson; // Added ToJson trait for map serialization
use yrs::updates::decoder::Decode;
use yrs::updates::encoder::Encode;

#[wasm_bindgen]
pub struct WasmCollaborator {
    doc: Doc,
}

#[wasm_bindgen]
impl WasmCollaborator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { doc: Doc::new() }
    }

    /// Apply a binary update from a remote peer (Yjs protocol)
    pub fn apply_update(&self, update: &[u8]) -> Result<(), JsValue> {
        let mut txn = self.doc.transact_mut();
        let update = Update::decode_v1(update).map_err(|e| JsValue::from_str(&e.to_string()))?;
        txn.apply_update(update);
        Ok(())
    }

    /// Encode the current State Vector (compact representation of version)
    pub fn encode_state_vector(&self) -> Vec<u8> {
        let txn = self.doc.transact();
        txn.state_vector().encode_v1()
    }

    /// Calculate the diff between local state and a remote state vector
    pub fn encode_diff(&self, remote_sv_binary: &[u8]) -> Result<Vec<u8>, JsValue> {
        let txn = self.doc.transact();
        let sv = StateVector::decode_v1(remote_sv_binary).map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(txn.encode_diff_v1(&sv))
    }

    /// Get the standard 'elements' map as a JSON string
    /// This bridges the CRDT world to the Snapshot world
    pub fn get_elements_json(&self) -> String {
        let txn = self.doc.transact();
        let map = txn.get_map("elements"); // Assuming root map is named 'elements'
        if let Some(map) = map {
            // Serialize the YMap to JSON
            // yrs 0.18 has specific JSON interop
            let json = map.to_json(&txn);
            let mut s = String::new();
            json.to_json(&mut s);
            s
        } else {
            "{}".to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use yrs::{WriteTxn, Map}; // Added Map trait necessary for insert

    #[test]
    fn test_synchronization() {
        // 1. Create two collaborators (Client A and Client B)
        let client_a = WasmCollaborator::new();
        let client_b = WasmCollaborator::new();

        // 2. Client A makes a change (Simulated by inserting into internal doc)
        {
            let mut txn = client_a.doc.transact_mut();
            let map = txn.get_or_insert_map("elements");
            map.insert(&mut txn, "el-1", "Button"); // Simple key-value for test
        }

        // 3. Sync A -> B
        // Get State Vector from B (What does B have?)
        let sv_b = client_b.encode_state_vector();
        
        // Compute Diff for B (What does A have that B needs?)
        let diff = client_a.encode_diff(&sv_b).expect("Failed to encode diff");
        
        // Apply Diff to B
        client_b.apply_update(&diff).expect("Failed to apply update");

        // 4. Verification
        let json_a = client_a.get_elements_json();
        let json_b = client_b.get_elements_json();

        assert_eq!(json_a, json_b, "States should be identical after sync");
        assert!(json_b.contains("Button"), "Client B should have the data");
    }
}
