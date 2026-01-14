"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
    children: React.ReactNode;
    speed?: number; // 0-1, 0 = no movement, 1 = fast
    className?: string;
    style?: React.CSSProperties;
    backgroundImage?: string;
}

export function ParallaxSection({
    children,
    speed = 0.5,
    className = "",
    style = {},
    backgroundImage
}: ParallaxSectionProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div
            ref={ref}
            className={`parallax-section ${className}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style
            }}
        >
            {backgroundImage && (
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: -50, // Bleed for parallax
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        y: y, // Apply parallax transform
                        zIndex: 0
                    }}
                />
            )}

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {children}
            </div>
        </div>
    );
}
