/**
 * OMNIOS Unified Blueprint Specification
 * This file defines the contract for logic execution across both kernels.
 */

export type LogicNodeType =
    | 'on_click'
    | 'on_load'
    | 'on_change'
    | 'on_scroll'
    | 'on_data'
    | 'on_mount'
    | 'navigate'
    | 'set_var'
    | 'alert'
    | 'wait'
    | 'condition'
    | 'loop'
    | 'api_request'
    | 'server_function'
    | 'auth_login'
    | 'auth_logout'
    | 'auth_guard'
    | 'json_parse'
    | 'script'
    | 'native_api'
    // Batch 11.2: Server-Side Workflow Nodes
    | 'db_trigger'
    | 'cron_trigger'
    | 'webhook_trigger'
    | 'send_email'
    | 'send_sms'
    | 'stripe_charge'
    | 'openai_completion'
    | 'db_query'
    | 'db_insert'
    | 'billing_report_usage'
    | 'billing_check_limit';

export interface UnifiedNode {
    id: string;
    type: LogicNodeType | string;
    name: string;
    position: { x: number; y: number };
    data: Record<string, any>;
    inputs: string[];
    outputs: string[];
}

export interface UnifiedConnection {
    id: string;
    fromId: string;
    toId: string;
    port?: 'default' | 'true' | 'false' | string;
}

export interface UnifiedBlueprint {
    id: string;
    name?: string;
    nodes: Record<string, UnifiedNode>;
    connections: UnifiedConnection[];
    variables: Record<string, { type: string; initialValue: any }>;
}
