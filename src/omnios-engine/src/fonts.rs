use wasm_bindgen::prelude::*;
use ttf_parser::Face;

pub struct FontAnalyzer;

impl FontAnalyzer {
    pub fn list_missing_glyphs(font_data: &[u8], text: &str) -> Result<String, String> {
        let face = Face::parse(font_data, 0)
            .map_err(|e| format!("Failed to parse font: {}", e))?;

        let mut missing = Vec::new();

        for c in text.chars() {
            if face.glyph_index(c).is_none() {
                missing.push(c);
            }
        }

        if missing.is_empty() {
            Ok("All glyphs present".to_string())
        } else {
            let missing_str: String = missing.into_iter().collect();
            Ok(format!("Missing glyphs: {}", missing_str))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_font_analyzer_invalid() {
        // 1. Pass garbage data
        let result = FontAnalyzer::list_missing_glyphs(&[0, 1, 2, 3], "abc");
        
        // 2. Expect error (proving ttf-parser is actually running)
        assert!(result.is_err());
        let err = result.err().unwrap();
        assert!(err.contains("Failed to parse font"));
    }
}
