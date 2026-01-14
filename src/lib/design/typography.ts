export const calculateFluidTypography = (
    minSize: number,
    maxSize: number,
    minViewport: number = 320,
    maxViewport: number = 1200
): string => {
    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const yAxisIntersection = -minViewport * slope + minSize;
    return `clamp(${minSize}px, ${yAxisIntersection.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${maxSize}px)`;
};
