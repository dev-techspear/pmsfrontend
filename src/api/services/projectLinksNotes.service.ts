import { api } from '@/api/client';

export interface ProjectLink {
    id: number;
    project_id: number;
    title: string;
    url: string;
    link_type: string;
    description?: string | null;
    restrict_access: boolean;
    shared_role_ids: number[];
    shared_user_ids: number[];
    created_by_name?: string | null;
    created_at: string;
    can_manage: boolean;
}

export interface ProjectLinkInput {
    title: string;
    url: string;
    link_type: string;
    description?: string;
    restrict_access: boolean;
    role_ids: number[];
    user_ids: number[];
}

export interface ProjectNote {
    id: number;
    project_id: number;
    title?: string | null;
    body: string;
    is_pinned: boolean;
    restrict_access: boolean;
    shared_role_ids: number[];
    shared_user_ids: number[];
    author_name?: string | null;
    created_at: string;
    updated_at?: string | null;
    can_manage: boolean;
}

export interface ProjectNoteInput {
    body: string;
    title?: string;
    is_pinned: boolean;
    restrict_access: boolean;
    role_ids: number[];
    user_ids: number[];
}

export const projectLinksService = {
    list: async (projectId: number): Promise<ProjectLink[]> => (await api.get(`/projects/${projectId}/links`)).data,
    create: async (projectId: number, p: ProjectLinkInput): Promise<ProjectLink> => (await api.post(`/projects/${projectId}/links`, p)).data,
    update: async (projectId: number, id: number, p: Partial<ProjectLinkInput>): Promise<ProjectLink> =>
        (await api.put(`/projects/${projectId}/links/${id}`, p)).data,
    remove: async (projectId: number, id: number): Promise<void> => { await api.delete(`/projects/${projectId}/links/${id}`); },
};

export const projectNotesService = {
    list: async (projectId: number): Promise<ProjectNote[]> => (await api.get(`/projects/${projectId}/notes`)).data,
    create: async (projectId: number, p: ProjectNoteInput): Promise<ProjectNote> => (await api.post(`/projects/${projectId}/notes`, p)).data,
    update: async (projectId: number, id: number, p: Partial<ProjectNoteInput>): Promise<ProjectNote> =>
        (await api.put(`/projects/${projectId}/notes/${id}`, p)).data,
    remove: async (projectId: number, id: number): Promise<void> => { await api.delete(`/projects/${projectId}/notes/${id}`); },
};
