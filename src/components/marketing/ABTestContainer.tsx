"use client";

import React, { useState, useEffect } from 'react';

interface ABTestContainerProps {
    variants: React.ReactNode[];
    weights?: number[]; // Percentage weights, e.g., [50, 50]
    testId: string;
}

export function ABTestContainer({ variants, weights, testId }: ABTestContainerProps) {
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    useEffect(() => {
        // Simple client-side randomizer based on weights
        // In prod, this should be sticky (cookie/localStorage)
        const storageKey = `ab_test_${testId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            setActiveVariantIndex(parseInt(stored, 10));
        } else {
            const random = Math.random() * 100;
            let sum = 0;
            let chosenIndex = 0;

            const normalizedWeights = weights || variants.map(() => 100 / variants.length);

            for (let i = 0; i < normalizedWeights.length; i++) {
                sum += normalizedWeights[i];
                if (random <= sum) {
                    chosenIndex = i;
                    break;
                }
            }

            setActiveVariantIndex(chosenIndex);
            localStorage.setItem(storageKey, chosenIndex.toString());

            // Simulate tracking "View"
            console.log(`[AB-TEST] View recorded for Test ${testId}, Variant ${chosenIndex}`);
        }
    }, [testId, weights, variants]);

    if (!variants || variants.length === 0) return null;

    return <>{variants[activeVariantIndex]}</>;
}
