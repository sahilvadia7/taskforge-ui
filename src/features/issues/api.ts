import { apiClient } from "@/lib/api-client";
import { Issue, IssueListResponse, IssueType, IssuePriority, IssueStatus, CreateIssueRequest, UpdateIssueRequest } from "./types";
// Backend DTO
interface BackendIssue {
    id: string;
    tenantId: string;
    projectId: string;
    type: string; // "TASK"
    title: string;
    description?: string;
    status: string; // "TODO"
    priority: string; // "HIGH"
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatarUrl?: string;
    reporterId: string;
    sprintId?: string;
    parentId?: string; // Add parentId here
    startDate?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt?: string;
    starred?: boolean;
    storyPoints?: number;
}

// Helpers
const mapTypeToFrontend = (type: string): IssueType => {
    const map: Record<string, IssueType> = {
        "TASK": "TASK",
        "BUG": "BUG",
        "STORY": "STORY",
        "EPIC": "EPIC"
    };
    return map[type] || "TASK";
};

const mapPriorityToFrontend = (priority: string): IssuePriority => {
    const map: Record<string, IssuePriority> = {
        "URGENT": "URGENT",
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW",
        "BLOCKER": "BLOCKER",
        "CRITICAL": "CRITICAL",
        "LOWEST": "LOWEST"
    };
    return map[priority] || "MEDIUM";
};

const mapStatusToFrontend = (status: string): IssueStatus => {
    // Identity map - allow backend status strings to pass through directly
    // This supports custom columns like "Testing", "QA", etc.
    return status;
};

const mapPriorityToBackend = (priority: string): string => {
    // Identity map or specific backend values if needed
    // Assuming backend uses same uppercase keys for now based on types
    return priority;
};

const mapBackendToFrontend = (data: BackendIssue): Issue => {
    return {
        id: data.id,
        key: `ISS-${data.id.substring(0, 4).toUpperCase()}`, // Fallback
        summary: data.title,
        description: data.description,
        type: mapTypeToFrontend(data.type),
        status: mapStatusToFrontend(data.status),
        priority: mapPriorityToFrontend(data.priority),
        projectId: data.projectId,
        sprintId: data.sprintId,
        parentId: data.parentId, // Map parentId
        startDate: data.startDate,
        dueDate: data.dueDate,
        createdAt: data.createdAt,

        updatedAt: data.updatedAt || new Date().toISOString(),
        reporter: { id: data.reporterId, name: "Reporter" }, // Minimal stub
        assignee: data.assigneeId ? {
            id: data.assigneeId,
            name: data.assigneeName || "Assignee",
            avatarUrl: data.assigneeAvatarUrl,
            displayName: data.assigneeName
        } : undefined,
        // Defaults for missing arrays
        comments: [],
        history: [],
        workLog: [],
        starred: data.starred || false,
        storyPoints: data.storyPoints
    };
};

export const getIssues = async (projectId: string): Promise<Issue[]> => {
    const response = await apiClient.get<BackendIssue[]>(`/projects/${projectId}/issues`);
    return response.data.map(mapBackendToFrontend);
};

export const getAllIssues = async (): Promise<Issue[]> => {
    const response = await apiClient.get<BackendIssue[]>("/issues");
    return response.data.map(mapBackendToFrontend);
};

export const getMyIssues = async (): Promise<Issue[]> => {
    const response = await apiClient.get<BackendIssue[]>("/issues/my");
    return response.data.map(mapBackendToFrontend);
};

export const getRecentIssues = async (): Promise<Issue[]> => {
    const response = await apiClient.get<BackendIssue[]>("/issues/recent");
    return response.data.map(mapBackendToFrontend);
};

export const getStarredIssues = async (): Promise<Issue[]> => {
    const response = await apiClient.get<BackendIssue[]>("/issues/starred");
    return response.data.map(mapBackendToFrontend);
};

export const getIssue = async (issueId: string): Promise<Issue> => {
    const response = await apiClient.get<BackendIssue>(`/issues/${issueId}`);
    return mapBackendToFrontend(response.data);
};

export const createIssue = async (data: CreateIssueRequest): Promise<Issue> => {
    const payload = {
        title: data.title,
        description: data.description,
        type: data.type.toUpperCase(),
        priority: mapPriorityToBackend(data.priority) || "MEDIUM",
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        ...(data.reporterId && { reporterId: data.reporterId }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.parentId && { parentId: data.parentId }),
        ...(data.sprintId && { sprintId: data.sprintId }),
        ...(data.storyPoints !== undefined && { storyPoints: data.storyPoints }),
    };

    const response = await apiClient.post<BackendIssue>("/issues", payload);
    return mapBackendToFrontend(response.data);
};

const mapStatusToBackend = (status?: string): string | undefined => {
    if (!status) return undefined;
    const map: Record<string, string> = {
        "TO DO": "TODO",
        "IN PROGRESS": "IN_PROGRESS",
        "IN REVIEW": "IN_REVIEW"
    };
    // If it's in the map, use the mapped value (e.g. legacy conversion)
    // Otherwise, pass it through exactly (supports "Testing", "QA", etc.)
    return map[status] || status;
};

export const updateIssue = async (issueId: string, data: UpdateIssueRequest): Promise<Issue> => {
    const payload = {
        ...data,
        ...(data.type && { type: data.type.toUpperCase() }),
        ...(data.priority && { priority: mapPriorityToBackend(data.priority) }),
        ...(data.status && { status: mapStatusToBackend(data.status) }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.sprintId && { sprintId: data.sprintId }),
        ...(data.starred !== undefined && { starred: data.starred }),
        ...(data.storyPoints !== undefined && { storyPoints: data.storyPoints }),
    };
    const response = await apiClient.patch<BackendIssue>(`/issues/${issueId}`, payload);
    return mapBackendToFrontend(response.data);
};

export const deleteIssue = async (issueId: string): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}`);
};

export const moveIssue = async (issueId: string, sprintId: string | null, targetIndex: number): Promise<Issue> => {
    const response = await apiClient.put<BackendIssue>(`/issues/${issueId}/move`, {
        sprintId,
        targetIndex
    });
    return mapBackendToFrontend(response.data);
};

// --- New API Methods ---
import { Comment, WorkLog, IssueHistory, ActivityItem } from "./types";

export const getIssueActivity = async (issueId: string): Promise<ActivityItem[]> => {
    const response = await apiClient.get<ActivityItem[]>(`/issues/${issueId}/activity`);
    return response.data;
};

export const getIssueComments = async (issueId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/issues/${issueId}/comments`);
    return response.data;
};

export const addIssueComment = async (issueId: string, text: string): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/issues/${issueId}/comments`, { text });
    return response.data;
};

export const getIssueHistory = async (issueId: string): Promise<IssueHistory[]> => {
    const response = await apiClient.get<IssueHistory[]>(`/issues/${issueId}/history`);
    return response.data;
};

export const getIssueWorkLogs = async (issueId: string): Promise<WorkLog[]> => {
    const response = await apiClient.get<WorkLog[]>(`/issues/${issueId}/worklogs`);
    return response.data;
};

export const addIssueWorkLog = async (issueId: string, data: { timeSpentMinutes: number; startedAt?: string; description?: string }): Promise<WorkLog> => {
    const response = await apiClient.post<WorkLog>(`/issues/${issueId}/worklogs`, data);
    return response.data;
};
