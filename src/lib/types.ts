export interface RdfFormatInfo {
    extensions: string[];
    mimeType: string;
}

export interface MossModule {
    id: string;
    label: string;
    description: string;
    language: string;
}

export interface MossTerminology {
    id: string;
    label: string;
    language: string;
}


export interface DatabusResource {
    id: string;
    title: string;
    abstract: string;
    description: string;
}

export interface SearchTag {
    id: string;
    label: string;
}

export interface MossFacet {
    id: string;
    label: string;
	predicate: string;
    sortOrder: number;
}

export interface UserInfo {
    sub?: string;
    username?: string;
    apiKeys?: string[];
    roles?: string[];
    permissions?: string[];
}

export interface CallerInfo {
    roles?: string[];
    permissions?: string[];
}

export interface MossRole {
    name: string;
    tokenRole?: string;
    permissions?: string[];
}

export interface RoleCreateRequest {
    name: string;
    tokenRole?: string;
    permissions?: string[];
}

export interface RoleUpdateRequest {
    tokenRole?: string;
}

export interface RolePermissionsRequest {
    permissions: string[];
}

export interface UserRolesRequest {
    roles: string[];
}

export interface ApiKeyCreateRequest {
    name: string;
}

export interface ApiKeyInfo {
    name: string;
    key: string;
}

export interface SetUsernameRequest {
    username: string;
}