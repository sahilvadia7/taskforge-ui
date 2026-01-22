import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectMembers,
    inviteProjectMember,
    InviteProjectMemberRequest,
    ProjectMember
} from "../api";
import { ProjectListResponse, Project, CreateProjectRequest, UpdateProjectRequest, ProjectInsightsResponse } from "../types";
import { getProjectInsights } from "../api";

import { useTenantStore } from "@/store/use-tenant-store";

// Mock Data
const MOCK_PROJECTS: Project[] = [
    {
        id: "demo-project-1",
        name: "Demo Project Alpha",
        key: "DEMO-A",
        description: "This is a demo project to showcase the platform capabilities.",
        template: "KANBAN",
        ownerId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "demo-project-2",
        name: "Marketing Campaign",
        key: "MKT",
        description: "Q4 Marketing initiatives and planning board.",
        template: "SCRUM",
        ownerId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

// Mock Members
export const MOCK_MEMBERS: ProjectMember[] = [
    { userId: "demo-user", displayName: "Demo User", email: "demo@example.com", role: "MANAGER" },
    { userId: "alice", displayName: "Alice Smith", email: "alice@example.com", role: "CONTRIBUTOR" },
    { userId: "bob", displayName: "Bob Jones", email: "bob@example.com", role: "QA" },
    { userId: "charlie", displayName: "Charlie Day", email: "charlie@example.com", role: "VIEWER" }
];

export const useProjects = () => {
    const { currentTenant } = useTenantStore();
    return useQuery<ProjectListResponse>({
        queryKey: ["projects", currentTenant?.id],
        queryFn: async () => {
            return getProjects();
        },
        enabled: !!currentTenant?.id,
    });
};

export const useProject = (projectId: string) => {
    const { currentTenant } = useTenantStore();
    return useQuery<Project>({
        queryKey: ["projects", projectId, currentTenant?.id],
        queryFn: async () => {
            return getProject(projectId);
        },
        enabled: !!projectId && !!currentTenant?.id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateProjectRequest) => {
            return createProject(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) => {
            return updateProject(projectId, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            return deleteProject(projectId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useProjectMembers = (projectId: string) => {
    return useQuery<ProjectMember[]>({
        queryKey: ["projects", projectId, "members"],
        queryFn: async () => {
            return getProjectMembers(projectId);
        },
        enabled: !!projectId,
    });
};

export const useAddProjectMember = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InviteProjectMemberRequest) => inviteProjectMember(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
        },
    });
};

export const useProjectInsights = (projectId: string) => {
    return useQuery<ProjectInsightsResponse>({
        queryKey: ["projects", projectId, "insights"],
        queryFn: async () => {
            return getProjectInsights(projectId);
        },
        enabled: !!projectId,
    });
};
