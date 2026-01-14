use wasm_bindgen::prelude::*;

pub struct PlaceholderGenerator;

impl PlaceholderGenerator {
    /// Generates a data:image/svg+xml string representing a gradient placeholder.
    /// This is used when the main image fails to load, preventing layout shift.
    pub fn synthesize(width: f32, height: f32, color_start: &str, color_end: &str) -> String {
        let svg = format!(
            r#"<svg width="{}" height="{}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:{};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:{};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="{}" height="{}" fill="url(#g)" />
            </svg>"#,
            width, height, color_start, color_end, width, height
        );
        
        // In production, we'd base64 encode it to use in <img src="data:...">
        svg
    }
}

#[wasm_bindgen]
pub fn generate_healing_placeholder(width: f32, height: f32, color_start: &str, color_end: &str) -> String {
    PlaceholderGenerator::synthesize(width, height, color_start, color_end)
}
