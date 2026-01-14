
export type MarketplacePlugin = MarketplaceItem;

export interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: 'design' | 'backend' | 'animation' | 'utility' | 'integration' | 'ui' | 'layout' | 'form' | 'data';
    type: 'plugin' | 'component'; // Batch 15.1
    price: number; // Batch 15.1
    icon: string; // URL or Lucide name
    coverImage?: string;
    downloads: number;
    rating: number; // 0-5
    tags: string[];
    permissions: string[]; // Mocking as string[] for simplicity in Service but mapping to types later
    manifestUrl: string; // Where the JSON manifest lives
    sourceUrl: string; // The .js bundle or JSON schema
}

// Mock Data for the MVP
const MOCK_REGISTRY: MarketplaceItem[] = [
    {
        id: 'com.omnios.stripe',
        name: 'Stripe Checkout',
        description: 'Drag-and-drop Stripe checkout buttons and pricing tables. Securely handle payments without backend code.',
        version: '1.2.0',
        author: 'Stripe Official',
        type: 'plugin',
        price: 0,
        category: 'integration',
        icon: 'CreditCard',
        downloads: 15420,
        rating: 4.8,
        tags: ['payments', 'ecommerce', 'checkout'],
        permissions: ['canvas:read', 'network:external'],
        manifestUrl: '/plugins/stripe/manifest.json',
        sourceUrl: '/plugins/stripe/bundle.js'
    },
    {
        id: 'com.community.seo-wizard',
        name: 'SEO Wizard',
        description: 'Automated SEO audit tool. Checks meta tags, alt texts, and structure. Generates sitemaps automatically.',
        version: '2.1.0',
        author: 'Sarah Dev',
        type: 'plugin',
        price: 0,
        category: 'utility',
        icon: 'Search',
        downloads: 8500,
        rating: 4.5,
        tags: ['seo', 'marketing', 'audit'],
        permissions: ['canvas:read', 'network:external'],
        manifestUrl: '/plugins/seo/manifest.json',
        sourceUrl: '/plugins/seo/bundle.js'
    },
    {
        id: 'com.motion.parallax',
        name: 'Parallax Hero',
        description: 'Create stunning 3D parallax effects on scroll. GPU optimized for 60fps animations.',
        version: '1.0.5',
        author: 'Motion Labs',
        type: 'plugin',
        price: 15,
        category: 'animation',
        icon: 'Layers',
        downloads: 12000,
        rating: 4.9,
        tags: ['animation', '3d', 'scroll'],
        permissions: ['canvas:read', 'canvas:write'],
        manifestUrl: '/plugins/parallax/manifest.json',
        sourceUrl: '/plugins/parallax/bundle.js'
    },
    {
        id: 'com.design.material',
        name: 'Material UI Kit',
        description: 'Complete set of Material Design 3 components. Buttons, Inputs, Cards, and more.',
        version: '3.0.0',
        author: 'Google',
        type: 'plugin',
        price: 0,
        category: 'design',
        icon: 'Palette',
        downloads: 45000,
        rating: 4.7,
        tags: ['ui', 'kit', 'material'],
        permissions: ['canvas:read', 'canvas:write'],
        manifestUrl: '/plugins/material/manifest.json',
        sourceUrl: '/plugins/material/bundle.js'
    },
    {
        id: 'com.backend.supabase',
        name: 'Supabase Connector',
        description: 'Connect your project to Supabase Auth & DB in one click.',
        version: '1.1.0',
        author: 'Supabase',
        type: 'plugin',
        price: 0,
        category: 'backend',
        icon: 'Database',
        downloads: 9800,
        rating: 4.8,
        tags: ['database', 'auth', 'postgres'],
        permissions: ['network:external', 'auth:read', 'secrets:read'],
        manifestUrl: '/plugins/supabase/manifest.json',
        sourceUrl: '/plugins/supabase/bundle.js'
    },
    // New Component Item Example
    {
        id: 'com.creator.button-pack',
        name: 'Neon Button Pack',
        description: 'A set of 12 glowing neon buttons with hover effects.',
        version: '1.0.0',
        author: 'NeonMaster',
        type: 'component',
        price: 5,
        category: 'ui',
        icon: 'Box',
        downloads: 230,
        rating: 4.2,
        tags: ['ui', 'buttons', 'neon'],
        permissions: [],
        manifestUrl: '',
        sourceUrl: ''
    }
];

export class MarketplaceService {

    // Simulate network delay
    private static async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async searchPlugins(query: string): Promise<MarketplaceItem[]> {
        await this.delay(300); // Fake network
        const lowerQ = query.toLowerCase();
        return MOCK_REGISTRY.filter(p =>
            p.name.toLowerCase().includes(lowerQ) ||
            p.description.toLowerCase().includes(lowerQ) ||
            p.tags.some(t => t.toLowerCase().includes(lowerQ))
        );
    }

    static async getPluginsByCategory(category: string): Promise<MarketplaceItem[]> {
        await this.delay(200);
        if (category === 'all') return MOCK_REGISTRY;
        return MOCK_REGISTRY.filter(p => p.category === category);
    }

    static async getPluginDetails(id: string): Promise<MarketplaceItem | null> {
        await this.delay(100);
        return MOCK_REGISTRY.find(p => p.id === id) || null;
    }

    static async getFeaturedPlugins(): Promise<MarketplaceItem[]> {
        await this.delay(200);
        // Simple heuristic: downloads > 10k
        return MOCK_REGISTRY.sort((a, b) => b.downloads - a.downloads).slice(0, 3);
    }

    static async publishItem(item: MarketplaceItem): Promise<boolean> {
        await this.delay(800);
        // Validate ID uniqueness
        if (MOCK_REGISTRY.find(p => p.id === item.id)) {
            throw new Error("Item ID already exists.");
        }
        MOCK_REGISTRY.unshift(item); // Add to top
        return true;
    }

    // Alias for backward compatibility if needed, or update consumers
    static async publishPlugin(plugin: MarketplaceItem) {
        return this.publishItem(plugin);
    }
}
