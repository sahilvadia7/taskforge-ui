export type ProjectTemplate = "KANBAN" | "SCRUM" | "BUG";

export const ALL_PROJECT_TEMPLATES: ProjectTemplate[] = ["KANBAN", "SCRUM", "BUG"];

export interface Project {
    id: string;
    name: string;
    description?: string;
    key: string;
    template: ProjectTemplate;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    boardConfig?: string;
}

export type ProjectListResponse = Project[];

export interface CreateProjectRequest {
    name: string;
    key: string;
    description?: string;
    template: ProjectTemplate;
}

export interface UpdateProjectRequest {
    name?: string;
    key?: string;
    description?: string;
    template?: ProjectTemplate;
    boardConfig?: string;
}

export interface TimeInStatusMetric {
    status: string;
    avgDays: number;
}

export interface ProjectInsightsResponse {
    highPriorityCount: number;
    overdueCount: number;
    timeInStatus: TimeInStatusMetric[];
}
