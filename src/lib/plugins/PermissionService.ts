import { PluginPermission } from '@/types/plugins';

interface PermissionDetail {
    label: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const PERMISSION_DETAILS: Record<PluginPermission, PermissionDetail> = {
    'canvas:read': {
        label: 'Read Design',
        description: 'See the structure and content of your pages.',
        riskLevel: 'low'
    },
    'canvas:write': {
        label: 'Modify Design',
        description: 'Add or change elements on your canvas.',
        riskLevel: 'medium'
    },
    'storage:write': {
        label: 'Save Data',
        description: 'Store settings or plugin data in your project.',
        riskLevel: 'low'
    },
    'network:external': {
        label: 'Internet Access',
        description: 'Send data to external servers (e.g., analytical tools, APIs).',
        riskLevel: 'high'
    },
    'auth:read': {
        label: 'Read User Info',
        description: 'See your email and user ID.',
        riskLevel: 'medium'
    },
    'secrets:read': {
        label: 'Read Secrets',
        description: 'Access API keys and environment variables. Grant with extreme caution.',
        riskLevel: 'critical'
    }
};

export class PermissionService {

    static getPermissionDetail(permission: PluginPermission): PermissionDetail {
        return PERMISSION_DETAILS[permission] || {
            label: permission,
            description: 'Unknown permission',
            riskLevel: 'high'
        };
    }

    static checkPermission(granted: PluginPermission[], required: PluginPermission): boolean {
        return granted.includes(required);
    }

    static explainRisks(permissions: PluginPermission[]): string[] {
        return permissions
            .map(p => this.getPermissionDetail(p))
            .filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical')
            .map(d => `WARNING: Allows ${d.label} - ${d.description}`);
    }
}
