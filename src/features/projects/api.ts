import { apiClient } from "@/lib/api-client";
import { Project, ProjectListResponse, CreateProjectRequest, UpdateProjectRequest, ProjectInsightsResponse } from "./types";

export const getProjects = async (): Promise<ProjectListResponse> => {
    const response = await apiClient.get<ProjectListResponse>("/projects");
    return response.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
};

export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>("/projects", data);
    return response.data;
};

export const updateProject = async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${projectId}`, data);
    return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
};

export interface ProjectMember {
    userId: string;
    displayName: string;
    email: string;
    role: "MANAGER" | "CONTRIBUTOR" | "QA" | "VIEWER";
    avatarUrl?: string | null;
    user?: {
        avatarUrl?: string | null;
    };
}

export interface InviteProjectMemberRequest {
    email: string;
    role: "MANAGER" | "CONTRIBUTOR" | "QA" | "VIEWER";
}

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return response.data;
};

export const inviteProjectMember = async (projectId: string, data: InviteProjectMemberRequest): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/members`, data);
};

export const getProjectInsights = async (projectId: string): Promise<ProjectInsightsResponse> => {
    const response = await apiClient.get<ProjectInsightsResponse>(`/projects/${projectId}/insights`);
    return response.data;
};
