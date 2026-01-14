use omnios_engine::runtime::{RuntimeAdapter, RuntimeRequest, RuntimeResponse};
use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};
use std::thread;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    println!("OMNIOS Serverless Bridge running on 127.0.0.1:8080");

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        thread::spawn(|| {
            handle_connection(stream);
        });
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 4096]; // 4KB buffer
    stream.read(&mut buffer).unwrap();

    let request_str = String::from_utf8_lossy(&buffer);
    
    // Improved HTTP parsing
    // Request Line: "POST /deploy HTTP/1.1"
    let mut lines = request_str.lines();
    let request_line = lines.next().unwrap_or("");
    let parts: Vec<&str> = request_line.split_whitespace().collect();
    
    if parts.len() < 2 {
        println!("Invalid Request Line");
        return;
    }
    
    let method = parts[0];
    let path = parts[1];

    // Extract Headers
    let mut auth_token = "";
    for line in lines {
        if line.starts_with("Authorization: Bearer ") {
            auth_token = &line[22..].trim();
        }
    }
    
    // AUTH CHECK (Skip for localhost/dev if needed, but enforcing for Batch 2.6)
    // For demo purposes, we accept "omni_secret" as a bypass or require a valid JWT signed with "secret_key"
    use omnios_engine::core::auth::AuthGuard;
    
    // Simple Bypass for testing: if token is "omni_admin", we allow it.
    // Real JWT check:
    let is_authorized = if auth_token == "omni_admin" {
        true
    } else if !auth_token.is_empty() {
        AuthGuard::verify(auth_token, "my_secret_key").is_some()
    } else {
        false // Reject if no token
    };

    if !is_authorized {
        println!("Unauthorized Access Attempt");
         let err = "{\"error\": \"Unauthorized\"}";
         let response = format!(
            "HTTP/1.1 401 UNAUTHORIZED\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
            err.len(),
            err
        );
        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
        return;
    }
    
    // Extract Body
    let body_start = request_str.find("\r\n\r\n").map(|i| i + 4).unwrap_or(0);
    let body = &request_str[body_start..];
    let trimmed_body = body.trim_matches(char::from(0));

    println!("Request: {} {}", method, path);

    // MOCK ROUTER LOGIC
    // In a real scenario, the Blueprint ID would be in the URL, e.g. /run/:blueprint_id
    // For now, we expect the BODY to contain the blueprint (RuntimeRequest) because we are stateless serverless
    
    let response = if let Ok(mut req) = serde_json::from_str::<RuntimeRequest>(trimmed_body) {
        
        // OVERRIDE TRIGGER BASED ON METHOD
        // If the user sent a specific trigger in JSON, we might keep it, 
        // OR we enforce REST semantic mapping if they hit a specific endpoint.
        // Let's say: 
        // IF path == "/api/execute" -> Use req.trigger
        // IF path starts with "/api/rest/" -> Map to "api_get", "api_post" etc.
        
        if path.starts_with("/api/rest") {
            let trigger_name = format!("api_{}", method.to_lowercase()); // api_get, api_post
            println!("Mapping REST request to trigger: {}", trigger_name);
            req.trigger = trigger_name;
        }

        let res = RuntimeAdapter::handle_request(req);
        let res_json = serde_json::to_string(&res).unwrap();
        
        format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
            res_json.len(),
            res_json
        )
    } else {
        println!("Failed to parse JSON body");
        let err = "{\"error\": \"Invalid JSON Request\"}";
        format!(
            "HTTP/1.1 400 BAD REQUEST\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
            err.len(),
            err
        )
    };

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
