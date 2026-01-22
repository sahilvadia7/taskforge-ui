import { apiClient } from "@/lib/api-client";
import { Page } from "@/store/use-page-store";

export interface CreatePageRequest {
    title: string;
    content: string;
    parentId?: string | null;
    projectId: string;
    icon?: string;
}

export interface UpdatePageRequest {
    title?: string;
    content?: string;
    parentId?: string | null;
    icon?: string;
}

export const pagesApi = {
    getPages: async (projectId: string): Promise<Page[]> => {
        const response = await apiClient.get<Page[]>(`/projects/${projectId}/pages`);
        return response.data;
    },

    getPage: async (pageId: string): Promise<Page> => {
        const response = await apiClient.get<Page>(`/pages/${pageId}`);
        return response.data;
    },

    createPage: async (projectId: string, data: CreatePageRequest): Promise<Page> => {
        const response = await apiClient.post<Page>(`/projects/${projectId}/pages`, data);
        return response.data;
    },

    updatePage: async (pageId: string, data: UpdatePageRequest): Promise<Page> => {
        const response = await apiClient.patch<Page>(`/pages/${pageId}`, data);
        return response.data;
    },

    deletePage: async (pageId: string): Promise<void> => {
        await apiClient.delete(`/pages/${pageId}`);
    },
};
