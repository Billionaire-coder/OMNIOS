import { DesignToken, ElementStyles } from "@/types/designer";

interface AestheticTheme {
    name: string;
    keywords: string[];
    tokens: Partial<DesignToken>[]; // Tokens to update/add
    globalStyles?: Partial<ElementStyles>; // Default styles for generic elements
}

const THEMES: AestheticTheme[] = [
    {
        name: 'Cyberpunk Neon',
        keywords: ['cyberpunk', 'neon', 'matrix', 'future', 'dark mode'],
        tokens: [
            { name: 'primary', value: '#00ff99', type: 'color' }, // Neon Green
            { name: 'secondary', value: '#ff00ff', type: 'color' }, // Neon Pink
            { name: 'background', value: '#050505', type: 'color' }, // Deep Black
            { name: 'surface', value: '#111111', type: 'color' },
            { name: 'text-primary', value: '#e0e0e0', type: 'color' },
            { name: 'radius-sm', value: '0px', type: 'radius' }, // Sharp corners
            { name: 'radius-md', value: '2px', type: 'radius' },
        ]
    },
    {
        name: 'Corporate Clean',
        keywords: ['corporate', 'clean', 'blue', 'professional', 'saas'],
        tokens: [
            { name: 'primary', value: '#0066cc', type: 'color' }, // Trust Blue
            { name: 'secondary', value: '#f0f4f8', type: 'color' }, // Light Grey/Blue
            { name: 'background', value: '#ffffff', type: 'color' },
            { name: 'surface', value: '#f8f9fa', type: 'color' },
            { name: 'text-primary', value: '#1a1a1a', type: 'color' },
            { name: 'radius-sm', value: '4px', type: 'radius' },
            { name: 'radius-md', value: '8px', type: 'radius' },
        ]
    },
    {
        name: 'Pastel Dream',
        keywords: ['pastel', 'soft', 'cute', 'playful'],
        tokens: [
            { name: 'primary', value: '#ffb7b2', type: 'color' }, // Pastel Red
            { name: 'secondary', value: '#e2f0cb', type: 'color' }, // Pastel Green
            { name: 'background', value: '#fff9f5', type: 'color' }, // Warm White
            { name: 'surface', value: '#ffffff', type: 'color' },
            { name: 'text-primary', value: '#4a4a4a', type: 'color' },
            { name: 'radius-sm', value: '12px', type: 'radius' }, // Very round
            { name: 'radius-md', value: '24px', type: 'radius' },
        ]
    }
];

export const rewriteAesthetic = (prompt: string, currentTokens: DesignToken[]): DesignToken[] => {
    const lowerPrompt = prompt.toLowerCase();

    // Find best matching theme
    const matchedTheme = THEMES.find(t => t.keywords.some(k => lowerPrompt.includes(k)));

    if (!matchedTheme) {
        console.warn("No aesthetic match found for prompt:", prompt);
        return currentTokens; // Return unmatched
    }

    console.log(`[AestheticEngine] Applying Theme: ${matchedTheme.name}`);

    // Merge new tokens into current tokens
    const newTokens = [...currentTokens];

    matchedTheme.tokens.forEach(update => {
        const existingIndex = newTokens.findIndex(t => t.name === update.name);
        if (existingIndex >= 0) {
            // Update existing
            newTokens[existingIndex] = { ...newTokens[existingIndex], ...update };
        } else {
            // Add new if it doesn't exist (assuming standard set)
            // Ideally we don't add random tokens, but for 'primary' etc it works.
        }
    });

    return newTokens;
};
