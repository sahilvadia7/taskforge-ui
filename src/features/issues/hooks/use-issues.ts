import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIssues, getIssue, createIssue, updateIssue, deleteIssue, moveIssue, getMyIssues, getRecentIssues, getStarredIssues, getAllIssues } from "../api";
import { Issue, CreateIssueRequest, UpdateIssueRequest } from "../types";
import { useTenantStore } from "@/store/use-tenant-store";

export const useIssues = (projectId: string) => {
    return useQuery<Issue[]>({
        queryKey: ["issues", projectId],
        queryFn: async () => {
            return getIssues(projectId);
        },
        enabled: !!projectId,
        refetchInterval: 60000, // Poll every 15 seconds (less frequent to reduce load)
        staleTime: 10000 // Consider data fresh for 10 seconds
    });
};

export const useIssue = (issueId: string) => {
    return useQuery<Issue>({
        queryKey: ["issues", "detail", issueId],
        queryFn: async () => {
            return getIssue(issueId);
        },
        enabled: !!issueId
    });
};

export const useMyIssues = () => {
    const currentTenant = useTenantStore((state) => state.currentTenant);
    return useQuery<Issue[]>({
        queryKey: ["issues", "my", currentTenant?.id],
        queryFn: async () => {
            return getMyIssues();
        },
        enabled: !!currentTenant?.id
    });
};

export const useAllIssues = () => {
    const currentTenant = useTenantStore((state) => state.currentTenant);
    return useQuery<Issue[]>({
        queryKey: ["issues", "all", currentTenant?.id],
        queryFn: async () => {
            return getAllIssues();
        },
        enabled: !!currentTenant?.id
    });
};

export const useRecentIssues = () => {
    const currentTenant = useTenantStore((state) => state.currentTenant);
    return useQuery<Issue[]>({
        queryKey: ["issues", "recent", currentTenant?.id],
        queryFn: async () => {
            return getRecentIssues();
        },
        enabled: !!currentTenant?.id
    });
};

export const useCreateIssue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateIssueRequest) => {
            return createIssue(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["issues", variables.projectId] });
        },
    });
};

export const useUpdateIssue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ issueId, data }: { issueId: string; data: UpdateIssueRequest }) => {
            return updateIssue(issueId, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            queryClient.invalidateQueries({ queryKey: ["issues", "detail", data.id] });
        },
    });
};

export const useDeleteIssue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (issueId: string) => {
            return deleteIssue(issueId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
        },
    });
};

export const useMoveIssue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ issueId, sprintId, targetIndex }: { issueId: string, sprintId: string | null, targetIndex: number }) => {
            return moveIssue(issueId, sprintId, targetIndex);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
        },
    });
};

export const useStarredIssues = () => {
    const currentTenant = useTenantStore((state) => state.currentTenant);
    return useQuery<Issue[]>({
        queryKey: ["issues", "starred", currentTenant?.id],
        queryFn: async () => {
            return getStarredIssues();
        },
        enabled: !!currentTenant?.id
    });
};

import { getIssueComments, addIssueComment, getIssueWorkLogs, addIssueWorkLog, getIssueHistory, getIssueActivity } from "../api";
import { Comment, WorkLog, IssueHistory, ActivityItem } from "../types";

export const useIssueComments = (issueId: string) => {
    return useQuery<Comment[]>({
        queryKey: ["issues", "comments", issueId],
        queryFn: async () => getIssueComments(issueId),
        enabled: !!issueId
    });
};

export const useAddComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ issueId, text }: { issueId: string; text: string }) => {
            return addIssueComment(issueId, text);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["issues", "comments", variables.issueId] });
            queryClient.invalidateQueries({ queryKey: ["issues", "activity", variables.issueId] });
        },
    });
};

export const useIssueWorkLogs = (issueId: string) => {
    return useQuery<WorkLog[]>({
        queryKey: ["issues", "worklogs", issueId],
        queryFn: async () => getIssueWorkLogs(issueId),
        enabled: !!issueId
    });
};

export const useAddWorkLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ issueId, data }: { issueId: string; data: { timeSpentMinutes: number; startedAt?: string; description?: string } }) => {
            return addIssueWorkLog(issueId, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["issues", "worklogs", variables.issueId] });
            queryClient.invalidateQueries({ queryKey: ["issues", "activity", variables.issueId] });
        },
    });
};

export const useIssueHistory = (issueId: string) => {
    return useQuery<IssueHistory[]>({
        queryKey: ["issues", "history", issueId],
        queryFn: async () => getIssueHistory(issueId),
        enabled: !!issueId
    });
};

export const useIssueActivity = (issueId: string) => {
    return useQuery<ActivityItem[]>({
        queryKey: ["issues", "activity", issueId],
        queryFn: async () => getIssueActivity(issueId),
        enabled: !!issueId
    });
};
