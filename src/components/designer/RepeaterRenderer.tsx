
"use client";

import React, { useEffect, useState } from 'react';
import { DesignerElement, ProjectState, CollectionItem } from '@/types/designer';
import { useDB as usePGlite } from '@/lib/data/pglite/PGliteContext';
import { QueryGenerator } from '@/lib/data/orm/QueryGenerator';
import { DataContext } from '@/lib/context/DataContext';

export const RepeaterRenderer = ({
    element,
    state,
    onSelect,
    onMove,
    selectedElementId,
    elements,
    RendererComponent // Injected to avoid circular dependency
}: any) => {
    const { executeQuery, db, isLoading: isDbLoading } = usePGlite();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            // Wait for DB to be ready
            if (isDbLoading || !db) return;

            const collectionId = element.collectionId;
            if (!collectionId) {
                setLoading(false);
                return;
            }

            // Resolve collection name from ID
            const collection = state.data.collections.find((c: any) => c.id === collectionId);
            if (!collection) {
                console.warn("Repeater: Collection not found", collectionId);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Determine includes based on bound fields in children
                // For MVP, we'll just check if any child has a binding like "author.name"
                // But inspecting children deep is hard here.
                // Alternative: User specifies 'include' in Repeater props.
                // For now, auto-detect simple relationships? Or just pass empty.
                const includes: string[] = [];
                if (element.includes) {
                    includes.push(...element.includes);
                }

                const query = QueryGenerator.generateQuery(collection, state.data.collections, {
                    filters: element.filter,
                    sort: element.sort,
                    limit: element.limit,
                    offset: element.pagination?.enabled ? 0 : undefined,
                    include: includes
                });

                console.debug('[Repeater] Executing:', query);
                const rows = await executeQuery(query);
                setItems(rows);
                setError(null);
            } catch (e: any) {
                console.error("Repeater Query Failed", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [
        element.collectionId,
        // Deep comparison of complex objects is costly, 
        // typically we depend on specific version or stringified config
        JSON.stringify(element.filter),
        JSON.stringify(element.sort),
        element.limit,
        db,
        isDbLoading,
        state.data.collections
    ]);

    if (loading || isDbLoading) {
        return (
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255,255,255,0.1)',
                color: '#888',
                fontSize: '12px'
            }}>
                Loading Data from PGlite...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '10px', color: '#ff4444', fontSize: '12px', border: '1px solid #ff4444' }}>
                Query Error: {error}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                border: '1px dashed #444',
                color: '#666',
                fontSize: '12px'
            }}>
                No items found in active collection
            </div>
        );
    }

    return (
        <div style={{ display: 'contents' }}>
            {items.map((item: any) => (
                <DataContext.Provider value={item} key={item.id}>
                    {element.children?.map((childId: string) => (
                        <RendererComponent
                            key={`${childId} -${item.id} `}
                            elementId={childId}
                            elements={elements}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                            onMove={onMove}
                        />
                    ))}
                </DataContext.Provider>
            ))}
        </div>
    );
}
