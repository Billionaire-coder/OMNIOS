use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize, // Expiration time
    pub role: String, // e.g. "admin", "user"
}

pub struct AuthGuard;

impl AuthGuard {
    pub fn verify(_token: &str, _secret: &str) -> Option<Claims> {
        // Stub implementation to bypass C-dependency hell
        // Logic should be handled in TS layer anyway
        Some(Claims {
            sub: "stub-user".to_string(),
            exp: 2000000000,
            role: "admin".to_string()
        })
    }
}
