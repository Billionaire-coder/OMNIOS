"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface RevealImageProps {
    src: string;
    alt?: string;
    revealEffect?: "liquid" | "wave" | "glitch" | "none";
    className?: string;
    style?: React.CSSProperties;
    width?: string;
    height?: string;
}

export function RevealImage({
    src,
    alt = "Image",
    revealEffect = "liquid",
    className = "",
    style = {},
    width = "100%",
    height = "100%"
}: RevealImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Simplistic CSS/SVG filter simulation of WebGL shaders for now
    // A real WebGL shader needs Three.js or similar, which might be heavy.
    // We stick to high-end CSS/SVG trickery.

    const getFilter = () => {
        if (!isHovered) return "none";
        switch (revealEffect) {
            case "liquid":
                return "url('#liquidFilter')";
            case "wave":
                return "url('#waveFilter')";
            case "glitch":
                return "contrast(1.5) brightness(1.2)"; // Simple simulation
            default:
                return "none";
        }
    };

    return (
        <div
            className={`reveal-image-container ${className}`}
            style={{ position: 'relative', overflow: 'hidden', width, height, ...style }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="liquidFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.005" numOctaves="5" seed="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="B" />
                    </filter>
                    <filter id="waveFilter">
                        <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
                        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            <motion.img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: getFilter(),
                    transition: 'filter 0.3s ease'
                }}
                animate={{
                    scale: isHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.5 }}
            />

            {revealEffect === "glitch" && isHovered && (
                <>
                    <div style={{
                        position: 'absolute', inset: 0, background: `url(${src})`, backgroundSize: 'cover',
                        mixBlendMode: 'multiply', transform: 'translate(5px, 0)', opacity: 0.5
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0, background: `url(${src})`, backgroundSize: 'cover',
                        mixBlendMode: 'color-dodge', transform: 'translate(-5px, 0)', opacity: 0.5
                    }} />
                </>
            )}
        </div>
    );
}
