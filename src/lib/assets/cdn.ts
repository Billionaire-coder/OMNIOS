
import { Asset } from '@/types/designer';

interface BrandingOptions {
    width?: number;
    quality?: number;
    format?: 'webp' | 'png' | 'jpg';
    filter?: string;
}

export function getDynamicAssetUrl(asset: Asset, options: BrandingOptions = {}): string {
    // Phase 3: Dynamic Asset API Simulation
    // In a real system, this would point to a service like Cloudinary or Imgix
    // For OMNIOS v1, we append query params that could be read by an image loader
    // or simply return the raw URL if no meaningful transformation can be mocked client-side.

    let url = asset.optimizedUrl || asset.url;

    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('fmt', options.format);
    if (options.filter) params.set('filter', options.filter);

    if (url.startsWith('data:')) return url; // Cannot transform data URIs

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
}
