import type { UserInfo } from '$lib/types';

export const PERMISSIONS = {
    READ_METADATA: 'read-metadata',
    READ_ENTRIES: 'read-entries',
    WRITE_ENTRIES: 'write-entries',
    WRITE_MODULES: 'write-modules',
    WRITE_TERMINOLOGIES: 'write-terminologies',
    WRITE_FACETS: 'write-facets',
    READ_USERS: 'read-users',
    WRITE_ROLES: 'write-roles'
} as const;

export const ROLE_ADMIN = 'admin';
export const ROLE_PUBLIC = 'public';
export const ROLE_DEFAULT = 'default';

export const SYSTEM_ROLES = [ROLE_ADMIN, ROLE_PUBLIC, ROLE_DEFAULT] as const;
export const ALWAYS_ASSIGNED_USER_ROLES = [ROLE_PUBLIC, ROLE_DEFAULT] as const;

const NON_DELETABLE_ROLES = new Set<string>(SYSTEM_ROLES);

export function isAdminRole(roleName: string): boolean {
    return roleName === ROLE_ADMIN;
}

export function isAlwaysAssignedUserRole(roleName: string): boolean {
    return roleName === ROLE_PUBLIC || roleName === ROLE_DEFAULT;
}

export function isNonDeletableRole(roleName: string): boolean {
    return NON_DELETABLE_ROLES.has(roleName);
}

export function compareRoles(a: string, b: string): number {
    const aIndex = SYSTEM_ROLES.indexOf(a as (typeof SYSTEM_ROLES)[number]);
    const bIndex = SYSTEM_ROLES.indexOf(b as (typeof SYSTEM_ROLES)[number]);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
}

export function hasPermission(user: UserInfo | null | undefined, permission: string): boolean {
    return user?.permissions?.includes(permission) ?? false;
}

export function hasAdminAccess(user: UserInfo | null | undefined): boolean {
    return getDefaultAdminPath(user) !== null;
}

export function getDefaultAdminPath(user: UserInfo | null | undefined): string | null {
    if (hasPermission(user, PERMISSIONS.WRITE_MODULES)) return '/admin/modules';
    if (hasPermission(user, PERMISSIONS.WRITE_TERMINOLOGIES)) return '/admin/terminologies';
    if (hasPermission(user, PERMISSIONS.WRITE_FACETS)) return '/admin/facets';
    if (hasPermission(user, PERMISSIONS.READ_USERS) || hasPermission(user, PERMISSIONS.WRITE_ROLES)) {
        return '/admin/users';
    }
    return null;
}

export function isAccessDenied(status: number | undefined): boolean {
    return status === 401 || status === 403;
}
