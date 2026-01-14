import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { RBACService } from '@/lib/auth/RBACService';
import { Permission, Role } from '@/types/rbac';

interface RestrictedProps {
    to?: Permission;
    role?: Role;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const Restricted: React.FC<RestrictedProps> = ({ to, role, fallback = null, children }) => {
    const { state } = useProjectStore();
    const user = state.currentUser;

    let allowed = false;

    if (role) {
        allowed = RBACService.hasRole(user, role);
    } else if (to) {
        allowed = RBACService.hasPermission(user, to);
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
