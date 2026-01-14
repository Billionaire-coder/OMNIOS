import { ProjectState, Asset } from '@/types/designer';
import { DesignerElement } from '@/types/designer';

export interface CollectedAsset {
    originalUrl: string; // The URL in the browser (e.g. blob: or s3 link)
    exportPath: string; // Where it should go in public/ e.g. "assets/image-1.png"
    type: 'image' | 'video' | 'font';
}

export class AssetCollector {

    public collectAssets(state: ProjectState): CollectedAsset[] {
        const assets: Map<string, CollectedAsset> = new Map();
        let counter = 1;

        // Traverse all elements
        Object.values(state.elements).forEach(element => {
            this.extractFromElement(element, assets, () => counter++);
        });

        // Traverse styles that might have background images (Phase 1.3 extended)
        // TODO: Scan custom CSS / tokens if they contain urls

        return Array.from(assets.values());
    }

    private extractFromElement(
        element: DesignerElement,
        assets: Map<string, CollectedAsset>,
        nextId: () => number
    ) {
        // 1. Image Component
        if (element.type === 'image' && element.media?.src) {
            this.addAsset(element.media.src, 'image', assets, nextId);
        }

        // 2. Video Component
        if (element.type === 'video' && element.media?.src) {
            this.addAsset(element.media.src, 'video', assets, nextId);
        }

        // 3. Background Images in Styles
        if (element.styles?.backgroundImage && element.styles.backgroundImage.includes('url(')) {
            const url = this.parseUrl(element.styles.backgroundImage);
            if (url) this.addAsset(url, 'image', assets, nextId);
        }
    }

    private addAsset(
        url: string,
        type: 'image' | 'video' | 'font',
        assets: Map<string, CollectedAsset>,
        nextId: () => number
    ) {
        if (assets.has(url)) return; // Already seen

        // Determine extension
        const ext = this.getExtension(url) || (type === 'image' ? 'png' : 'mp4');
        const fileName = `asset-${nextId()}.${ext}`;

        assets.set(url, {
            originalUrl: url,
            exportPath: `assets/${fileName}`,
            type
        });
    }

    private parseUrl(bgStr: string): string | null {
        // url("...") or url('...') or url(...)
        const match = bgStr.match(/url\(['"]?(.*?)['"]?\)/);
        return match ? match[1] : null;
    }

    private getExtension(url: string): string | null {
        try {
            // Handle blob: urls or data: uris logic differently ideally
            if (url.startsWith('data:')) {
                const match = url.match(/data:image\/([a-zA-Z]*);/);
                return match ? match[1] : null;
            }
            const path = new URL(url).pathname;
            const parts = path.split('.');
            return parts.length > 1 ? parts[parts.length - 1] : null;
        } catch {
            return null;
        }
    }
}
