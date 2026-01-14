
// @ts-ignore
import RBush from 'rbush';

export interface SpatialItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    id: string;
}

export class SpatialEngine {
    private tree: any;
    // Keep a map for fast "remove by ID" lookup, as RBush remove needs the exact object reference
    private itemMap: Map<string, SpatialItem> = new Map();

    constructor() {
        this.tree = new RBush();
    }

    public static instance = new SpatialEngine();

    /**
     * Index or Update an element's bounds in the spatial tree.
     */
    public updateElement(id: string, x: number, y: number, width: number, height: number) {
        // Remove existing if present
        this.removeElement(id);

        const item: SpatialItem = {
            minX: x,
            minY: y,
            maxX: x + width,
            maxY: y + height,
            id
        };

        this.tree.insert(item);
        this.itemMap.set(id, item);
    }

    public removeElement(id: string) {
        const existing = this.itemMap.get(id);
        if (existing) {
            this.tree.remove(existing);
            this.itemMap.delete(id);
        }
    }

    public clear() {
        this.tree.clear();
        this.itemMap.clear();
    }

    /**
     * Find elements that intersect with the given area.
     */
    public query(x: number, y: number, width: number, height: number): string[] {
        const results = this.tree.search({
            minX: x,
            minY: y,
            maxX: x + width,
            maxY: y + height
        });
        return (results as SpatialItem[]).map((r: SpatialItem) => r.id);
    }

    /**
     * Find nearest snap targets for an element being dragged.
     * Searches a slightly larger area than the element itself.
     */
    public findSnapTargets(id: string, x: number, y: number, width: number, height: number, threshold: number = 10) {
        // Search expanded area
        const candidates = this.tree.search({
            minX: x - threshold,
            minY: y - threshold,
            maxX: x + width + threshold,
            maxY: y + height + threshold
        });

        const guides: any[] = [];
        let snappedX = x;
        let snappedY = y;

        // Simple Snapping Logic (Edges)
        (candidates as SpatialItem[]).forEach((other: SpatialItem) => {
            if (other.id === id) return;

            // X-Axis Snap (Left-Left)
            if (Math.abs(other.minX - x) < threshold) {
                snappedX = other.minX;
                guides.push({ orientation: 'vertical', value: other.minX, label: '' });
            }
            // X-Axis (Right-Right)
            if (Math.abs(other.maxX - (x + width)) < threshold) {
                snappedX = other.maxX - width;
                guides.push({ orientation: 'vertical', value: other.maxX, label: '' });
            }

            // Y-Axis Snap (Top-Top)
            if (Math.abs(other.minY - y) < threshold) {
                snappedY = other.minY;
                guides.push({ orientation: 'horizontal', value: other.minY, label: '' });
            }
            // Y-Axis (Bottom-Bottom)
            if (Math.abs(other.maxY - (y + height)) < threshold) {
                snappedY = other.maxY - height;
                guides.push({ orientation: 'horizontal', value: other.maxY, label: '' });
            }
        });

        return { x: snappedX, y: snappedY, guides };
    }
}

export const spatialEngine = SpatialEngine.instance;
