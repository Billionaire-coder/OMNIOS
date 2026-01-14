export const generateBlurPlaceholder = async (src: string): Promise<string> => {
    // In a real implementation, this would fetch the image and generate a base64 blur.
    // Since we are running in the browser/client context for now, and 'sharp' works server-side,
    // we will simulate this or use a simple canvas-based approach if needed later.
    // For now, return a generic grey placeholder or null to simulate the data structure.

    return 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
};

export const getOptimizedSizes = (width: string | number): string => {
    // Generate 'sizes' prop for next/image based on container width
    // If width is percentage, assume full viewport width for safety, or a reasonable estimate.

    if (typeof width === 'number') return `${width}px`;
    if (typeof width === 'string' && width.endsWith('px')) return width;

    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
};
