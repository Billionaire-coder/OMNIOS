export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export type Permission =
    | 'project:read'
    | 'project:write'
    | 'project:delete'
    | 'secrets:read'
    | 'secrets:write'
    | 'ent:deploy'
    | 'users:read'
    | 'users:write';

export const ROLE_PERMISSIONS: Record<Role, Permission[] | ['*']> = {
    owner: ['*'],
    admin: [
        'project:read',
        'project:write',
        'project:delete',
        'secrets:read',
        'secrets:write',
        'ent:deploy',
        'users:read',
        'users:write'
    ],
    editor: [
        'project:read',
        'project:write',
        'ent:deploy'
    ],
    viewer: [
        'project:read'
    ]
};
