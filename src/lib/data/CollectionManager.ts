import { Collection, CollectionItem, CollectionField, ProjectState } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';

export class CollectionManager {
    private state: ProjectState;
    private setState: (state: ProjectState) => void;

    constructor(state: ProjectState, setState: (state: ProjectState) => void) {
        this.state = state;
        this.setState = setState;
    }

    // --- COLLECTION OPERATIONS ---

    createCollection(name: string, type: 'flat' | 'relational' = 'flat'): Collection {
        const newCollection: Collection = {
            id: uuidv4(),
            name,
            slug: this.slugify(name),
            type,
            fields: [
                // Default System Fields
                { id: 'f_name', name: 'Name', type: 'text', required: true, unique: true },
                { id: 'f_slug', name: 'Slug', type: 'text', required: true, unique: true },
            ]
        };

        const updatedCollections = [...this.state.data.collections, newCollection];

        // Update State
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                collections: updatedCollections
            }
        });

        return newCollection;
    }

    deleteCollection(collectionId: string) {
        // Filter out collection
        const updatedCollections = this.state.data.collections.filter(c => c.id !== collectionId);

        // Filter out items belonging to this collection
        const updatedItems = this.state.data.items.filter(i => i.collectionId !== collectionId);

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                collections: updatedCollections,
                items: updatedItems
            }
        });
    }

    updateCollection(id: string, updates: Partial<Collection>) {
        const updatedCollections = this.state.data.collections.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        this.setState({
            ...this.state,
            data: { ...this.state.data, collections: updatedCollections }
        });
    }

    // --- FIELD OPERATIONS ---

    addField(collectionId: string, field: Omit<CollectionField, 'id'>) {
        const collection = this.getCollection(collectionId);
        if (!collection) return;

        const newField: CollectionField = {
            id: `f_${uuidv4().split('-')[0]}`, // Short ID for readability
            ...field
        };

        const updatedCollections = this.state.data.collections.map(c => {
            if (c.id === collectionId) {
                return { ...c, fields: [...c.fields, newField] };
            }
            return c;
        });

        this.setState({
            ...this.state,
            data: { ...this.state.data, collections: updatedCollections }
        });
    }

    updateField(collectionId: string, fieldId: string, updates: Partial<CollectionField>) {
        const updatedCollections = this.state.data.collections.map(c => {
            if (c.id === collectionId) {
                const updatedFields = c.fields.map(f =>
                    f.id === fieldId ? { ...f, ...updates } : f
                );
                return { ...c, fields: updatedFields };
            }
            return c;
        });

        this.setState({
            ...this.state,
            data: { ...this.state.data, collections: updatedCollections }
        });
    }

    // --- ITEM OPERATIONS ---

    addItem(collectionId: string, values: Record<string, any>) {
        const collection = this.getCollection(collectionId);
        if (!collection) return;

        // Validation could go here

        const newItem: CollectionItem = {
            id: uuidv4(),
            collectionId,
            values: {
                ...values,
                // System field defaults if missing
                slug: values.slug || this.slugify(values.name || '')
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'published'
        };

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                items: [...this.state.data.items, newItem]
            }
        });

        return newItem;
    }

    updateItem(itemId: string, values: Record<string, any>) {
        const updatedItems = this.state.data.items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    values: { ...item.values, ...values },
                    updatedAt: Date.now()
                };
            }
            return item;
        });

        this.setState({
            ...this.state,
            data: { ...this.state.data, items: updatedItems }
        });
    }

    deleteItem(itemId: string) {
        const updatedItems = this.state.data.items.filter(i => i.id !== itemId);
        this.setState({
            ...this.state,
            data: { ...this.state.data, items: updatedItems }
        });
    }

    // --- HELPERS ---

    getCollection(id: string) {
        return this.state.data.collections.find(c => c.id === id);
    }

    getItems(collectionId: string) {
        return this.state.data.items.filter(i => i.collectionId === collectionId);
    }

    private slugify(text: string) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
}
