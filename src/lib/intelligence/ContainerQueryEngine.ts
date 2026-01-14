
import { DesignerElement, ElementStyles } from '@/types/designer';

type QueryCallback = (elementId: string, matchedVariant: Partial<ElementStyles> | null) => void;

interface ContainerQuery {
    minWidth?: number;
    maxWidth?: number;
    styles: Partial<ElementStyles>;
}

export class ContainerQueryEngine {
    private static instance: ContainerQueryEngine;
    private observer: ResizeObserver | null = null;
    private listeners: Map<string, QueryCallback[]> = new Map();
    private queries: Map<string, ContainerQuery[]> = new Map();

    // Track last matched query index to avoid redundant updates
    private lastMatches: Map<string, number> = new Map();

    private constructor() {
        if (typeof window !== 'undefined') {
            this.observer = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    const id = (entry.target as HTMLElement).dataset.elementId;
                    if (id) {
                        this.evaluate(id, entry.contentRect.width);
                    }
                });
            });
        }
    }

    public static getInstance() {
        if (!ContainerQueryEngine.instance) {
            ContainerQueryEngine.instance = new ContainerQueryEngine();
        }
        return ContainerQueryEngine.instance;
    }

    /**
     * Define container queries for an element.
     */
    public setQueries(elementId: string, queries: ContainerQuery[]) {
        this.queries.set(elementId, queries);
    }

    /**
     * Start observing an HTML element as a container.
     */
    public observe(elementId: string, domElement: HTMLElement, callback?: QueryCallback) {
        if (!this.observer) return;

        domElement.dataset.elementId = elementId;
        this.observer.observe(domElement);

        if (callback) {
            if (!this.listeners.has(elementId)) {
                this.listeners.set(elementId, []);
            }
            this.listeners.get(elementId)!.push(callback);
        }
    }

    public unobserve(elementId: string, domElement: HTMLElement) {
        if (this.observer) {
            this.observer.unobserve(domElement);
        }
        this.listeners.delete(elementId);
        this.queries.delete(elementId);
        this.lastMatches.delete(elementId);
    }

    private evaluate(elementId: string, width: number) {
        const elementQueries = this.queries.get(elementId);
        if (!elementQueries) return;

        // Find the best matching query (last one that matches usually, or specifically sorted)
        // Let's assume standard "min-width" logic: Last match wins (mobile-first)
        let matchedIndex = -1;
        let matchedStyles: Partial<ElementStyles> | null = null;

        elementQueries.forEach((q, index) => {
            const minOk = q.minWidth === undefined || width >= q.minWidth;
            const maxOk = q.maxWidth === undefined || width <= q.maxWidth;

            if (minOk && maxOk) {
                matchedIndex = index;
                matchedStyles = q.styles;
            }
        });

        // Optimization: Only notify if match changed
        if (this.lastMatches.get(elementId) !== matchedIndex) {
            this.lastMatches.set(elementId, matchedIndex);

            const callbacks = this.listeners.get(elementId);
            if (callbacks) {
                callbacks.forEach(cb => cb(elementId, matchedStyles));
            }
        }
    }
}

export const containerQueryEngine = ContainerQueryEngine.getInstance();
