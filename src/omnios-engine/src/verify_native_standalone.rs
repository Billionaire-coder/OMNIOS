// MOCK COMPILER LIB (Manual to avoid deps)
pub struct NativeBundle {
    pub target_os: String, 
    pub entry_point: String,
    pub binary_size_est: u64,
}

pub struct NativeCompiler;

impl NativeCompiler {
    pub fn compile_target(project_name: &str, target_os: &str) -> NativeBundle {
        let binary_size = match target_os {
            "windows" => 15_000_000, 
            "macos" => 12_000_000,   
            _ => 10_000_000,
        };

        NativeBundle {
            target_os: target_os.to_string(),
            entry_point: format!("{}::{}_main", project_name, target_os),
            binary_size_est: binary_size,
        }
    }
}

// --- VERIFICATION RUNNER ---
fn main() {
    println!(">>> STARTING NATIVE COMPILER VERIFICATION >>>");

    let windows_bundle = NativeCompiler::compile_target("MyApp", "windows");
    println!("Target: Windows | Size: {} bytes", windows_bundle.binary_size_est);
    
    if windows_bundle.binary_size_est == 15_000_000 {
        println!("PASS: Windows size correct");
    } else {
        panic!("FAIL: Windows size wrong");
    }

    if windows_bundle.entry_point == "MyApp::windows_main" {
        println!("PASS: Windows entry point correct");
    } else {
        panic!("FAIL: Windows entry point wrong");
    }

    let linux_bundle = NativeCompiler::compile_target("MyApp", "linux");
    println!("Target: Linux   | Size: {} bytes", linux_bundle.binary_size_est);
     if linux_bundle.binary_size_est == 10_000_000 {
        println!("PASS: Linux size correct");
    } else {
        panic!("FAIL: Linux size wrong");
    }

    println!("<<< VERIFICATION SUCCESSFUL: Native Compiler Stub Working >>>");
}
