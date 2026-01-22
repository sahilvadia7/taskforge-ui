export type IssuePriority = "BLOCKER" | "CRITICAL" | "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST";
export const ALL_ISSUE_PRIORITIES: IssuePriority[] = ["BLOCKER", "CRITICAL", "URGENT", "HIGH", "MEDIUM", "LOW", "LOWEST"];

// Core statuses (strict enum-like for defaults)
export type IssueStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "IN_TESTING" | "DONE" | "BLOCKED" | "CLOSED" | "REOPENED" | "RESOLVED" | string;
export const ALL_ISSUE_STATUSES: IssueStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "IN_TESTING", "DONE", "BLOCKED", "CLOSED", "REOPENED", "RESOLVED"];

export type IssueType = "EPIC" | "STORY" | "TASK" | "BUG" | "SUB_TASK";
export const ALL_ISSUE_TYPES: IssueType[] = ["EPIC", "STORY", "TASK", "BUG", "SUB_TASK"];

export interface User {
    id: string;
    name: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface Sprint {
    id: string;
    name: string;
    status: "PLANNED" | "ACTIVE" | "COMPLETED";
    goal?: string;
    startDate?: string;
    endDate?: string;
    projectId: string;
}

export interface Comment {
    id: string;
    issueId: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
    updatedAt?: string;
}

export interface WorkLog {
    id: string;
    issueId: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    timeSpentMinutes: number;
    startedAt: string;
    description?: string;
    createdAt: string;
}

export interface IssueHistory {
    id: string;
    issueId: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    field: string;
    oldValue?: string;
    newValue?: string;
    createdAt: string;
}

export type ActivityType = "HISTORY" | "COMMENT" | "WORKLOG";

export interface ActivityItem {
    id: string;
    type: ActivityType;
    createdAt: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    data: Comment | IssueHistory | WorkLog; // Union of possible data types
}

export interface Issue {
    id: string;
    key: string; // e.g., "PROJ-123"
    summary: string;
    description?: string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    storyPoints?: number;
    sortOrder?: number;
    sprintId?: string | null;
    parentId?: string;
    assignee?: User;
    reporter: User;
    startDate?: string;
    dueDate?: string;
    comments?: Comment[];
    history?: IssueHistory[];
    workLog?: WorkLog[];
    createdAt: string;
    updatedAt: string;
    projectId: string;
    starred?: boolean;
}

export interface IssueListResponse {
    data: Issue[];
    total: number;
}

export interface CreateIssueRequest {
    title: string;
    description?: string;
    type: IssueType;
    priority: IssuePriority;
    projectId: string;
    assigneeId?: string;
    reporterId?: string;
    sprintId?: string;
    startDate?: string;
    dueDate?: string;
    parentId?: string;
    storyPoints?: number;
}

export interface UpdateIssueRequest extends Partial<CreateIssueRequest> {
    status?: IssueStatus;
    starred?: boolean;
    storyPoints?: number;
}
