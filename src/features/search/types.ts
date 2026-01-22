export interface IssueSearchResult {
    id: string;
    key: string;
    summary: string;
    projectId: string;
    status: string;
    type: string;
}

export interface ProjectSearchResult {
    id: string;
    key: string;
    name: string;
    description: string | null;
}

export interface PageSearchResult {
    id: string;
    title: string;
    projectId: string;
}

export interface SearchResultResponse {
    issues: IssueSearchResult[];
    projects: ProjectSearchResult[];
    pages: PageSearchResult[];
}
