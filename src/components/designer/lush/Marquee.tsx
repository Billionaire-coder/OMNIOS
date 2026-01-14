"use client";

import React, { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number; // Duration in seconds for one loop
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export function Marquee({
    children,
    speed = 20,
    direction = "left",
    pauseOnHover = true,
    className = "",
    style = {}
}: MarqueeProps) {
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const startAnimation = async () => {
            if (!contentRef.current || !containerRef.current) return;

            // Calculate width for seamless loop
            // We clone children, so duplicate width.
            // Move from 0 to -50% (if traversing whole length of duplicate)

            await controls.start({
                x: direction === "left" ? "-50%" : "0%",
                transition: {
                    duration: speed,
                    ease: "linear",
                    repeat: Infinity,
                }
            });
        };

        if (direction === "left") {
            controls.set({ x: "0%" });
        } else {
            controls.set({ x: "-50%" });
        }

        startAnimation();
    }, [controls, speed, direction]);

    return (
        <div
            className={`marquee-container ${className}`}
            style={{
                overflow: "hidden",
                display: "flex",
                width: "100%",
                ...style
            }}
            ref={containerRef}
            onMouseEnter={() => pauseOnHover && controls.stop()}
            onMouseLeave={() => pauseOnHover && controls.start({
                x: direction === "left" ? "-50%" : "0%",
                transition: { duration: speed, ease: "linear", repeat: Infinity }
            })}
        >
            <motion.div
                className="marquee-content"
                ref={contentRef}
                animate={controls}
                style={{ display: "flex", width: "fit-content", minWidth: "200%" }}
            >
                <div style={{ display: "flex", flexShrink: 0, justifyContent: 'space-around', minWidth: '100%' }}>
                    {children}
                </div>
                <div style={{ display: "flex", flexShrink: 0, justifyContent: 'space-around', minWidth: '100%' }}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
