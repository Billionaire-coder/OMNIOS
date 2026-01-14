use omnios_engine::plugins::logic_kernel::{LogicKernel, UnifiedBlueprint};
use std::env;
use std::fs;

fn main() {
    // Basic Logger init (if we had env_logger, but simple print for MVP)
    println!("OMNIOS Logic Kernel - Standalone Mode");
    
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: omnios-cli <blueprint_file.json> <trigger_name> [payload_json]");
        return;
    }

    let blueprint_path = &args[1];
    let trigger = &args[2];
    let payload_str = if args.len() > 3 { &args[3] } else { "{}" };

    println!("Loading Blueprint: {}", blueprint_path);
    
    let content = match fs::read_to_string(blueprint_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            return;
        }
    };

    let blueprint: UnifiedBlueprint = match serde_json::from_str(&content) {
        Ok(bp) => bp,
        Err(e) => {
            eprintln!("Error parsing blueprint JSON: {}", e);
            return;
        }
    };

    let payload: serde_json::Value = serde_json::from_str(payload_str).unwrap_or(serde_json::Value::Null);

    // Initialize Kernel
    let mut kernel = LogicKernel::new();
    kernel.register_blueprint(blueprint.clone()); // Clone needed because register consumes ownership or blueprint used below?
    // Using clone to keep 'blueprint' for ID access if needed, though execute takes ID string.

    println!("Executing Trigger: '{}' on Blueprint: '{}'", trigger, blueprint.id);
    
    kernel.execute(&blueprint.id, trigger, &payload);

    println!("Execution Complete.");
    println!("Final Runtime Variables: {:?}", kernel.runtime_variables);
}
