import { z } from 'zod';

// Schema for Webhook payloads (Phase 1)
export const WebhookPayloadSchema = z.object({
    eventType: z.string(),
    payload: z.record(z.string(), z.any()),
    timestamp: z.number().optional()
});

// Schema for Figma Plugin Push
export const FigmaPushSchema = z.object({
    fileKey: z.string(),
    nodes: z.array(z.any()), // Refine this with actual Figma Node schema later
    token: z.string().optional()
});

// Schema for Runner Execution
export const RunnerExecuteSchema = z.object({
    flowId: z.string().uuid(),
    inputs: z.record(z.string(), z.any()),
    permissions: z.object({
        network: z.boolean().optional(),
        allowedDomains: z.array(z.string()).optional()
    }).optional(),
    sync: z.boolean().optional()
});

// General User Identity Schema
export const UserIdentitySchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(['owner', 'admin', 'editor', 'viewer'])
});
