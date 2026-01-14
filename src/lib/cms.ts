import { ProjectState, CollectionItem } from '@/types/designer';

/**
 * Resolves reference fields in a collection item by looking up the related items
 * in the project state. Returns a denormalized object where reference IDs are 
 * replaced (or augmented) by the actual referenced item data.
 * 
 * @param item The source item to resolve
 * @param state The global project state containing all collections and items
 * @param depth How many levels deep to resolve references (avoid infinite loops)
 */
export function resolveReferences(item: CollectionItem, state: ProjectState, depth: number = 1): Record<string, any> {
    if (!item) return {};

    // Start with the raw values
    const resolved: Record<string, any> = {
        ...item.values,
        id: item.id,
        _collectionId: item.collectionId
    };

    // Find the schema definition for this item's collection
    const collection = state.data.collections.find(c => c.id === item.collectionId);
    if (!collection) return resolved;

    // Stop recursion if depth limit reached
    if (depth <= 0) return resolved;

    // Iterate over fields to find references
    collection.fields.forEach(field => {
        if (field.type === 'reference' && field.referenceCollectionId) {
            const refId = item.values[field.id];

            if (refId && typeof refId === 'string') {
                // Find the referenced item
                const targetItem = state.data.items.find(i => i.id === refId && i.collectionId === field.referenceCollectionId);

                if (targetItem) {
                    // Recursively resolve certain fields of the target item
                    // We map it to [fieldName] -> Resolved Object
                    // Note: This replaces the ID string with an object. 
                    // Consumers need to handle this (e.g. check typeof).
                    resolved[field.id] = resolveReferences(targetItem, state, depth - 1);
                } else {
                    // Dangling reference
                    resolved[field.id] = null;
                }
            }
        }
    });

    return resolved;
}
