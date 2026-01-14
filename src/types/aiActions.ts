import { ElementType } from "./designer";

export type AIActionType = 'create_element' | 'update_style' | 'update_content' | 'delete_element';

export interface AIActionCreatePayload {
    type: ElementType;
    parentId: string;
    styles?: Record<string, string | number>;
    content?: string;
    props?: Record<string, any>;
}

export interface AIActionUpdateStylePayload {
    elementId: string;
    styles: Record<string, string | number>;
}

export interface AIActionUpdateContentPayload {
    elementId: string;
    content: string;
}

export interface AIActionDeletePayload {
    elementId: string;
}

export type AIAction =
    | { type: 'create_element', payload: AIActionCreatePayload }
    | { type: 'update_style', payload: AIActionUpdateStylePayload }
    | { type: 'update_content', payload: AIActionUpdateContentPayload }
    | { type: 'delete_element', payload: AIActionDeletePayload };

export interface AIExecutionResult {
    success: boolean;
    message?: string;
    actionType: AIActionType;
}
