import { api } from '@/api/client';

export interface ProjectCredential {
    id: number;
    project_id: number;
    label: string;
    credential_type: string;
    host?: string | null;
    username?: string | null;
    notes?: string | null;
    restrict_access: boolean;
    shared_role_ids: number[];
    shared_user_ids: number[];
    last_rotated_at?: string | null;
    created_at: string;
    can_manage: boolean;
}

export interface CredentialInput {
    label: string;
    credential_type: string;
    /** Required on create; on update leave empty to keep the stored secret. */
    secret?: string;
    host?: string;
    username?: string;
    notes?: string;
    restrict_access: boolean;
    role_ids: number[];
    user_ids: number[];
}

// Secrets are never part of list/create/update responses - only reveal() returns one.
export const credentialsService = {
    list: async (projectId: number): Promise<ProjectCredential[]> => {
        const { data } = await api.get(`/projects/${projectId}/credentials`);
        return data;
    },

    create: async (projectId: number, payload: CredentialInput): Promise<ProjectCredential> => {
        const { data } = await api.post(`/projects/${projectId}/credentials`, payload);
        return data;
    },

    update: async (projectId: number, id: number, payload: Partial<CredentialInput>): Promise<ProjectCredential> => {
        const { data } = await api.put(`/projects/${projectId}/credentials/${id}`, payload);
        return data;
    },

    remove: async (projectId: number, id: number): Promise<void> => {
        await api.delete(`/projects/${projectId}/credentials/${id}`);
    },

    reveal: async (projectId: number, id: number): Promise<string> => {
        const { data } = await api.post(`/projects/${projectId}/credentials/${id}/reveal`);
        return data.secret;
    },
};
