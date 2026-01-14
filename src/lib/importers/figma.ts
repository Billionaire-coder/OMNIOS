import { DesignToken } from "@/types/designer";
export { FigmaMapper } from './figmaMapper';
export { FigmaSyncService } from './figmaSyncService';
export const importFigmaTokens = (json: any): DesignToken[] => {
    const tokens: DesignToken[] = [];

    // Recursive function to traverse W3C format
    const traverse = (node: any, path: string = '') => {
        if (node.$value) {
            tokens.push({
                id: Math.random().toString(36).substr(2, 9),
                name: path.replace(/^\./, ''),
                type: node.$type === 'color' ? 'color' : 'size', // Simplified mapping
                value: node.$value,
                modes: node.$extensions?.["com.figma"]?.modes || {}
            });
        } else {
            Object.keys(node).forEach(key => {
                if (key !== '$extensions') {
                    traverse(node[key], `${path}.${key}`);
                }
            });
        }
    };

    traverse(json);
    return tokens;
};
