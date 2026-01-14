import { DesignToken } from '@/types/designer';

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

export type IssueType = 'accessibility' | 'layout' | 'responsive' | 'consistency';

export interface DesignContext {
    tokens: DesignToken[];
}

export interface DesignIssue {
    id: string;
    type: IssueType;
    severity: IssueSeverity;
    message: string;
    elementId: string;
    description?: string;
    metadata?: Record<string, any>;
}

export interface DesignRule {
    id: string;
    name: string;
    check: (element: any, context: any) => DesignIssue | null;
}
