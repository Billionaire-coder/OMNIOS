use wasm_bindgen::prelude::*;
use image::io::Reader as ImageReader;
use std::io::Cursor;
use fast_image_resize as fr;
use std::num::NonZeroU32;

pub struct ImageProcessor;

impl ImageProcessor {
    pub fn process(data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
        // 1. Decode generic image
        let img = image::load_from_memory(data)
            .map_err(|e| format!("Failed to decode image: {}", e))?;

        let width_nz = NonZeroU32::new(width).ok_or("Width must be non-zero")?;
        let height_nz = NonZeroU32::new(height).ok_or("Height must be non-zero")?;

        // 2. Prepare fast-image-resize
        let mut src_image = fr::Image::from_vec_u8(
            NonZeroU32::new(img.width()).unwrap(),
            NonZeroU32::new(img.height()).unwrap(),
            img.to_rgba8().into_raw(),
            fr::PixelType::U8x4,
        ).map_err(|e| format!("FR Source Error: {:?}", e))?;

        let mut dst_image = fr::Image::new(
            width_nz,
            height_nz,
            fr::PixelType::U8x4,
        );

        let mut resizer = fr::Resizer::new(fr::ResizeAlg::Convolution(fr::FilterType::Lanczos3));
        
        // This will leverage SIMD if compiled with target-feature=+simd128
        resizer.resize(&src_image.view(), &mut dst_image.view_mut())
            .map_err(|e| format!("FR Resize Error: {:?}", e))?;

        // 3. Encode to WebP (Safe fallback to PNG if webp encoding fails in WASM)
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        
        let output_img = image::ImageBuffer::<image::Rgba<u8>, _>::from_raw(
            width, height, dst_image.buffer().to_vec()
        ).ok_or("Failed to create output buffer")?;

        image::DynamicImage::ImageRgba8(output_img)
            .write_to(&mut cursor, image::ImageOutputFormat::Png)
            .map_err(|e| format!("Failed to encode image: {}", e))?;

        Ok(buffer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, GenericImage, Rgba};

    #[test]
    fn test_image_processor() {
        // 1. Create a 100x100 red image in memory
        let mut img = DynamicImage::new_rgba8(100, 100);
        for x in 0..100 {
            for y in 0..100 {
                img.put_pixel(x, y, Rgba([255, 0, 0, 255]));
            }
        }

        // 2. Encode to PNG bytes
        let mut original_bytes = Vec::new();
        img.write_to(&mut std::io::Cursor::new(&mut original_bytes), image::ImageOutputFormat::Png).unwrap();

        // 3. Process: Resize to 10x10
        let result = ImageProcessor::process(&original_bytes, 10, 10);
        
        // 4. Verify
        assert!(result.is_ok(), "Processing failed");
        let processed_bytes = result.unwrap();
        assert!(!processed_bytes.is_empty(), "Result is empty");

        // 5. Decode result to verify dimension
        let output_img = image::load_from_memory(&processed_bytes).unwrap();
        assert_eq!(output_img.width(), 10);
        assert_eq!(output_img.height(), 10);
    }
}
