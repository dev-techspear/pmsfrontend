import { api } from '@/api/client';
import { User } from '@/api/services/users.service';

export interface Document {
    id: number;
    title: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size?: number;
    project_id: number;
    uploaded_by_email?: string;
    uploaded_by?: User;
    created_at: string;
    updated_at: string;
    /** True when the bytes live in storage (as opposed to a link-only document). */
    has_file?: boolean;
    /** False = every project viewer can open it; true = only the shared roles/people. */
    restrict_access?: boolean;
    shared_role_ids?: number[];
    shared_user_ids?: number[];
    /** Uploader or Admin: may change sharing / edit / delete. */
    can_manage?: boolean;
}

export interface DocumentCreate {
    title: string;
    description?: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    project_id: number;
}

export interface DocumentUpdate {
    title?: string;
    description?: string;
    file_url?: string;
    file_type?: string;
}

/** Who may open a file, chosen at upload time (and changeable later by the uploader/Admin). */
export interface DocumentSharing {
    restrict_access: boolean;
    role_ids: number[];
    user_ids: number[];
}

export const documentsService = {
    getDocuments: async (skip = 0, limit = 100, projectId?: number): Promise<Document[]> => {
        const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
        if (projectId) params.append('project_id', String(projectId));
        const { data } = await api.get(`/documents/?${params}`);
        return data;
    },

    getDocument: async (id: number): Promise<Document> => {
        const { data } = await api.get(`/documents/${id}`);
        return data;
    },

    createDocument: async (
        file: File,
        projectId: number,
        title?: string,
        description?: string,
        sharing?: DocumentSharing,
    ): Promise<Document> => {
        const form = new FormData();
        form.append('file', file);
        form.append('project_id', String(projectId));
        if (title) form.append('title', title);
        if (description) form.append('description', description);
        form.append('restrict_access', String(sharing?.restrict_access ?? false));
        if (sharing?.restrict_access) {
            sharing.role_ids.forEach(id => form.append('role_ids', String(id)));
            sharing.user_ids.forEach(id => form.append('user_ids', String(id)));
        }
        const { data } = await api.post('/documents/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    createLinkDocument: async (payload: DocumentCreate): Promise<Document> => {
        const { data } = await api.post('/documents/', payload);
        return data;
    },

    updateDocument: async (id: number, payload: DocumentUpdate): Promise<Document> => {
        const { data } = await api.put(`/documents/${id}`, payload);
        return data;
    },

    updateSharing: async (id: number, sharing: DocumentSharing): Promise<Document> => {
        const { data } = await api.put(`/documents/${id}/sharing`, sharing);
        return data;
    },

    /** Short-lived storage link, minted only after the server has checked the caller may see the file. */
    getDownloadUrl: async (id: number, inline = false): Promise<{ file_name: string; url: string }> => {
        const { data } = await api.get(`/documents/${id}/download`, { params: { inline } });
        return data;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await api.delete(`/documents/${id}`);
    },
};
