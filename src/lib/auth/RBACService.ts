import { Role, Permission, ROLE_PERMISSIONS } from '@/types/rbac';
import { User } from '@/types/designer';

export class RBACService {

    /**
     * Checks if a user has a specific permission.
     */
    static hasPermission(user: User | null, permission: Permission): boolean {
        if (!user || !user.role) return false;

        const userPermissions = ROLE_PERMISSIONS[user.role as Role];

        if (!userPermissions) return false;

        // Owner has all permissions
        if (userPermissions.length === 1 && userPermissions[0] === '*') return true;

        return (userPermissions as Permission[]).includes(permission);
    }

    /**
     * Checks if a user has a specific role or higher (hierarchy check could be implemented here).
     * For now, strict role check.
     */
    static hasRole(user: User | null, role: Role): boolean {
        return user?.role === role;
    }

    /**
     * Helper to get all permissions for a role
     */
    static getRolePermissions(role: Role): Permission[] | ['*'] {
        return ROLE_PERMISSIONS[role] || [];
    }
}
