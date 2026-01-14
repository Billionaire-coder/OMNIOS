import React, { useState, useEffect } from 'react';
import { hyperBridge } from '@/lib/engine/HyperBridge';

interface HybridImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackColors?: [string, string];
}

export const HybridImage: React.FC<HybridImageProps> = ({ src, alt, fallbackColors, className, style, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Reset when src changes
    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        if (hasError) return; // Prevent infinite loop
        setHasError(true);

        const width = 800; // Default mock dimension
        const height = 600;

        // Use provided colors or defaults (Pink/Purple)
        const [start, end] = fallbackColors || ['#ff0080', '#7928ca'];

        const placeholder = hyperBridge.generatePlaceholder(width, height, start, end);
        if (placeholder) {
            setImgSrc(placeholder);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt || "Asset"}
            onError={handleError}
            className={className}
            style={style}
            {...props}
        />
    );
};
