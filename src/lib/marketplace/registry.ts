
import { ThemeTemplate } from '@/types/designer';

export interface MarketplaceItem {
    id: string;
    type: 'theme' | 'plugin' | 'component';
    name: string;
    description: string;
    author: string;
    version: string;
    thumbnailUrl?: string;
    price?: number;
    downloads: number;
    rating: number;
    data: any; // content
}

export const marketplaceRegistry = {
    fetchItems: async (type?: 'theme' | 'plugin' | 'component') => {
        try {
            const params = new URLSearchParams();
            if (type) params.set('type', type);
            // params.set('sort', 'popular'); // Default

            // Use relative path for internal API
            const res = await fetch(`/_api/marketplace/search?${params.toString()}`);
            if (!res.ok) throw new Error('API Failed');

            const data = await res.json();

            // Parse 'data/content' field if it is a JSON string
            return data.map((item: any) => {
                let parsedContent = item.data;
                if (typeof item.data === 'string' && (item.data.startsWith('{') || item.data.startsWith('['))) {
                    try { parsedContent = JSON.parse(item.data); } catch (e) { }
                }
                return {
                    ...item,
                    data: parsedContent
                };
            });
        } catch (e) {
            console.warn("Marketplace API unavailable, returning empty list.", e);
            return [];
        }
    },

    installItem: async (item: MarketplaceItem) => {
        console.log(`Installing ${item.name}...`);
        // In future: Record installation in DB 'UserPurchases' table
        return true;
    },

    publishItem: async (payload: any) => {
        const res = await fetch('/_api/marketplace/publish', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }
};
