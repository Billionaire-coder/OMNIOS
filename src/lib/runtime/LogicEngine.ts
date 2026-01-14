import { UnifiedBlueprint, UnifiedNode, UnifiedConnection } from '@/types/logic';
import { billingService } from '../billing/BillingService';

export class LogicEngine {
    private blueprints: Record<string, UnifiedBlueprint> = {};
    private context: any;
    private projectData: any;
    private activeTenantId: string | null = null;

    constructor(context: any, projectData?: any, activeTenantId: string | null = null) {
        this.context = context;
        this.projectData = projectData;
        this.activeTenantId = activeTenantId;
    }

    updateProjectData(data: any, activeTenantId: string | null = null) {
        this.projectData = data;
        this.activeTenantId = activeTenantId;
    }

    registerBlueprint(blueprint: UnifiedBlueprint) {
        if (!blueprint) return;
        this.blueprints[blueprint.id] = blueprint;
    }

    registerBlueprints(blueprints: Record<string, UnifiedBlueprint>) {
        this.blueprints = { ...this.blueprints, ...blueprints };
    }

    trigger(blueprintId: string, nodeType: string, payload?: any) {
        const blueprint = this.blueprints[blueprintId];
        if (!blueprint) return;

        const startNodes = Object.values(blueprint.nodes).filter(n => n.type === nodeType);
        startNodes.forEach(node => this.executeNode(blueprint, node, payload));
    }

    private resolveTemplate(template: string, variables: Record<string, any>): string {
        if (typeof template !== 'string') return template;
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const val = variables[key.trim()];
            return val !== undefined ? String(val) : match;
        });
    }

    private async executeNode(blueprint: UnifiedBlueprint, node: UnifiedNode, payload?: any) {
        console.log(`[StandardKernel] Executing: ${node.id} (${node.type})`);

        let nextPort = 'default';

        try {
            const variables = this.context.getVariables?.() || {};
            const combinedContext = { ...variables, ...payload };

            switch (node.type) {
                case 'wait':
                    await new Promise(r => setTimeout(r, node.data.duration || 1000));
                    break;

                case 'navigate': {
                    const url = this.resolveTemplate(node.data.url || node.data.path, combinedContext);
                    if (url) this.context.navigate(url);
                    break;
                }

                case 'set_var':
                    if (node.data.varName) {
                        const value = typeof node.data.value === 'string'
                            ? this.resolveTemplate(node.data.value, combinedContext)
                            : node.data.value;
                        this.context.setVariable(node.data.varName, value);
                    }
                    break;

                case 'alert':
                    alert(this.resolveTemplate(node.data.message || "Alert", combinedContext));
                    break;

                case 'condition': {
                    const left = this.resolveTemplate(node.data.left, combinedContext);
                    const right = this.resolveTemplate(node.data.right, combinedContext);
                    const op = node.data.operator;

                    let result = false;
                    if (op === '==') result = String(left) === String(right);
                    if (op === '!=') result = String(left) !== String(right);
                    if (op === '>') result = Number(left) > Number(right);
                    if (op === '<') result = Number(left) < Number(right);

                    nextPort = result ? 'true' : 'false';
                    break;
                }

                case 'db_query': {
                    const collectionId = node.data.collectionId;
                    const collection = this.projectData.collections.find((c: any) => c.id === collectionId);

                    let items = this.projectData.items.filter((item: any) => item.collectionId === collectionId);

                    // Phase 12: Auto-Filter Multi-Tenant Queries
                    if (collection?.isMultiTenant) {
                        items = items.filter((item: any) => item.tenantId === this.activeTenantId);
                        console.log(`[Multi-Tenant] Filtered query for ${collection.name} by tenant ${this.activeTenantId}`);
                    }

                    if (node.data.outputVar) {
                        this.context.setVariable(node.data.outputVar, items);
                    }
                    break;
                }

                case 'db_insert': {
                    const collectionId = node.data.collectionId;
                    const values = node.data.values || {};

                    // Phase 12.3: Limit Check before Insert
                    const tenant = this.projectData.tenants?.find((t: any) => t.id === this.activeTenantId);
                    if (tenant?.billing) {
                        const currentRecords = tenant.usage.records || 0;
                        const limit = tenant.billing.limits.records;
                        if (currentRecords >= limit) {
                            console.error(`[Billing] Blocked insert for tenant ${this.activeTenantId}: Limit reached (${limit})`);
                            nextPort = 'limit_exceeded';
                            break;
                        }
                    }

                    // In the runtime, we delegate the actual state update to the context
                    if (this.context.addItem) {
                        this.context.addItem(collectionId, values);
                        console.log(`[Logic Engine] DB Insert into ${collectionId}`);
                    }
                    break;
                }

                case 'billing_report_usage': {
                    const metric = node.data.metric || 'records';
                    const amount = node.data.amount || 1;

                    if (this.activeTenantId) {
                        await billingService.reportUsage(this.activeTenantId, metric, amount);
                        // Also trigger a state update in the store via context
                        if (this.context.reportUsage) {
                            this.context.reportUsage(this.activeTenantId, metric, amount);
                        }
                    }
                    break;
                }

                case 'billing_check_limit': {
                    const metric = node.data.metric || 'records';
                    const tenant = this.projectData.tenants?.find((t: any) => t.id === this.activeTenantId);

                    if (tenant?.billing) {
                        const current = tenant.usage[metric as keyof typeof tenant.usage] || 0;
                        const limit = tenant.billing.limits[metric as keyof typeof tenant.billing.limits] || Infinity;

                        nextPort = current >= limit ? 'limit_exceeded' : 'within_limit';
                    }
                    break;
                }

                // Add more cases for parity as needed
            }
        } catch (err) {
            console.error(`[StandardKernel] Error in ${node.id}:`, err);
            return;
        }

        // --- UNIFIED TRAVERSAL ---
        const nextConnections = blueprint.connections.filter(c => {
            if (nextPort !== 'default') {
                return c.fromId === node.id && c.port === nextPort;
            }
            return c.fromId === node.id;
        });

        nextConnections.forEach(conn => {
            const nextNode = blueprint.nodes[conn.toId];
            if (nextNode) this.executeNode(blueprint, nextNode, payload);
        });
    }
}
