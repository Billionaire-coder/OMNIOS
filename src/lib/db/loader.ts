
import { db } from './database';
import { syncManager } from '@/lib/db/sync';
import { ProjectState, DesignerPage, DesignerElement, ElementStyles, CollectionItem } from '@/types/designer';
import { DBProject, DBPage, DBElement } from './schema';


export class DataLoader {

    public async loadProject(projectId: string): Promise<Partial<ProjectState> | null> {
        // 1. Fetch Project
        const projects = await db.query<DBProject>(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (projects.length === 0) return null;
        const project = projects[0];

        // 2. Fetch Pages
        const pages = await db.query<DBPage>(`SELECT * FROM pages WHERE project_id = $1`, [projectId]);

        // 3. Fetch Elements for all pages
        const elementsRows = await db.query<DBElement>(`
            SELECT e.* FROM elements e
            JOIN pages p ON e.page_id = p.id
            WHERE p.project_id = $1
    `, [projectId]);

        // 4. Fetch Logic
        const logicNodesRows = await db.query<any>(`SELECT * FROM logic_nodes WHERE project_id = $1`, [projectId]);
        const logicEdgesRows = await db.query<any>(`SELECT * FROM logic_edges WHERE project_id = $1`, [projectId]);

        // 5. Fetch Tokens
        const tokensRows = await db.query<any>(`SELECT * FROM design_tokens WHERE project_id = $1`, [projectId]);

        // 6. Fetch Serverless Functions
        const functionsRows = await db.query<any>(`SELECT * FROM serverless_functions WHERE project_id = $1`, [projectId]);

        // 6. Reconstruct Elements Map
        const elementsMap: Record<string, DesignerElement> = {};

        elementsRows.forEach(row => {
            elementsMap[row.id] = {
                id: row.id,
                type: row.type as any,
                parentId: row.parent_id,
                children: [],
                props: row.props || {},
                styles: row.styles || {},
                content: row.text_content || undefined
            };
        });

        // 7. Build Tree (Child Relationships)
        elementsRows.forEach(row => {
            if (row.parent_id && elementsMap[row.parent_id]) {
                const parent = elementsMap[row.parent_id];
                if (!parent.children) parent.children = [];
                parent.children.push(row.id);
            }
        });

        return {
            id: project.id,
            name: project.name,
            pages: pages.reduce((acc, p) => {
                acc[p.id] = {
                    id: p.id,
                    slug: p.slug,
                    name: p.title,
                    rootElementId: p.root_element_id,
                    path: p.slug,
                };
                return acc;
            }, {} as Record<string, DesignerPage>),
            activePageId: project.active_page_id || (pages.length > 0 ? pages[0].id : ''),
            elements: elementsMap,
            logicNodes: logicNodesRows.map((n: any) => ({
                id: n.id,
                type: n.type,
                data: n.data,
                position: n.position,
                measured: n.measured
            })),
            logicEdges: logicEdgesRows.map((e: any) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.source_handle,
                targetHandle: e.target_handle,
                data: e.data,
                label: e.label,
                type: e.type
            })),
            designSystem: {
                tokens: tokensRows.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    value: t.value,
                    type: t.type,
                    modes: t.modes
                })),
                classes: [],
                components: []
            },
            serverlessFunctions: functionsRows.reduce((acc: any, f: any) => {
                acc[f.id] = {
                    id: f.id,
                    name: f.name,
                    route: f.route,
                    code: f.code,
                    runtime: f.runtime,
                    lastDeployedAt: f.updated_at ? new Date(f.updated_at).getTime() : undefined
                };
                return acc;
            }, {}),
            selectedElementId: null,
            hoveredElementId: null,
            viewMode: 'desktop',
            canvasScale: 1,
            canvasPosition: { x: 0, y: 0 },
        } as Partial<ProjectState>;
    }

    public async saveProject(state: ProjectState) {
        const projectId = state.id || 'default-project';

        // 1. Upsert Project
        await db.query(
            `INSERT INTO projects(id, name, active_page_id, updated_at) VALUES($1, $2, $3, NOW()) ON CONFLICT(id) DO UPDATE SET name = $2, active_page_id = $3, updated_at = NOW()`,
            [projectId, state.name, state.activePageId]
        );

        // 2. Upsert Pages
        for (const page of Object.values(state.pages)) {
            await db.query(
                `INSERT INTO pages(id, project_id, slug, title, root_element_id) VALUES($1, $2, $3, $4, $5) ON CONFLICT(id) DO UPDATE SET slug = $3, title = $4, root_element_id = $5`,
                [page.id, projectId, page.slug, page.name, page.rootElementId]
            );
        }

        // 3. Upsert Elements
        for (const el of Object.values(state.elements)) {
            const pageId = state.activePageId || (Object.values(state.pages)[0]?.id);
            if (!pageId) continue;

            await db.query(
                `INSERT INTO elements(id, page_id, type, parent_id, props, styles, text_content) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT(id) DO UPDATE SET parent_id = $4, props = $5, styles = $6, text_content = $7`,
                [
                    el.id,
                    pageId,
                    el.type,
                    el.parentId,
                    JSON.stringify(el.props || {}),
                    JSON.stringify(el.styles || {}),
                    el.content
                ]
            );
        }

        // 4. Upsert Logic Nodes
        // Simple strategy: Clear and re-insert for nodes/edges/tokens (or use complex diffing)
        // For PGlite, clear and re-insert is fast enough for typical logic graphs
        await db.query(`DELETE FROM logic_nodes WHERE project_id = $1`, [projectId]);
        for (const node of state.logicNodes) {
            await db.query(
                `INSERT INTO logic_nodes(id, project_id, type, data, position, measured) VALUES($1, $2, $3, $4, $5, $6)`,
                [node.id, projectId, node.type, JSON.stringify(node.data || {}), JSON.stringify(node.position), JSON.stringify(node.measured)]
            );
        }

        // 5. Upsert Logic Edges
        await db.query(`DELETE FROM logic_edges WHERE project_id = $1`, [projectId]);
        for (const edge of state.logicEdges) {
            await db.query(
                `INSERT INTO logic_edges(id, project_id, source, target, source_handle, target_handle, data, label, type) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [edge.id, projectId, edge.source, edge.target, edge.sourceHandle, edge.targetHandle, JSON.stringify(edge.data || {}), edge.label, edge.type]
            );
        }

        // 6. Upsert Tokens
        await db.query(`DELETE FROM design_tokens WHERE project_id = $1`, [projectId]);
        for (const token of state.designSystem.tokens) {
            await db.query(
                `INSERT INTO design_tokens(id, project_id, name, value, type, modes) VALUES($1, $2, $3, $4, $5, $6)`,
                [token.id || token.name, projectId, token.name, token.value, token.type, JSON.stringify(token.modes || {})]
            );
        }

        // 7. Upsert Serverless Functions
        await db.query(`DELETE FROM serverless_functions WHERE project_id = $1`, [projectId]);
        for (const func of Object.values(state.serverlessFunctions || {})) {
            await db.query(
                `INSERT INTO serverless_functions(id, project_id, name, route, code, runtime) VALUES($1, $2, $3, $4, $5, $6)`,
                [func.id, projectId, func.name, func.route, func.code, func.runtime]
            );
        }

        console.log("Project Hive Saved to PGlite");
    }
}

export const dataLoader = new DataLoader();
