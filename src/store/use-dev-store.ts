import { create } from "zustand";

export interface Repository {
    id: string;
    name: string; // e.g. "taskforge-web"
    url: string;
    provider: "github" | "bitbucket" | "gitlab";
    lastSync: string;
}

export interface Branch {
    id: string;
    name: string; // e.g. "feature/TF-123-login"
    repositoryId: string;
    lastCommit: string;
    status: "active" | "stale" | "merged";
    author: { name: string; avatarUrl?: string };
}

export interface PullRequest {
    id: string;
    title: string;
    key: string; // e.g. "PR-45"
    repositoryId: string;
    sourceBranch: string;
    targetBranch: string;
    status: "OPEN" | "MERGED" | "DECLINED" | "DRAFT";
    author: { name: string; avatarUrl?: string };
    createdAt: string;
    reviewers: { name: string; avatarUrl?: string; status: "APPROVED" | "NEEDS_WORK" | "PENDING" }[];
}

export interface Commit {
    id: string;
    hash: string; // short hash
    message: string;
    author: { name: string; avatarUrl?: string };
    date: string;
    repositoryId: string;
    branchId: string;
}

interface DevStore {
    repositories: Repository[];
    branches: Branch[];
    pullRequests: PullRequest[];
    commits: Commit[];

    // Actions - for now primarily fetching mocks
    fetchData: (projectId: string) => void;
}

// Mock Data
const MOCK_REPOS: Repository[] = [
    { id: "r1", name: "taskforge-web", url: "https://github.com/org/taskforge-web", provider: "github", lastSync: new Date().toISOString() },
    { id: "r2", name: "taskforge-api", url: "https://github.com/org/taskforge-api", provider: "github", lastSync: new Date().toISOString() },
];

const MOCK_BRANCHES: Branch[] = [
    { id: "b1", name: "main", repositoryId: "r1", lastCommit: new Date().toISOString(), status: "active", author: { name: "Sahil Vadia" } },
    { id: "b2", name: "feature/TF-101-board-view", repositoryId: "r1", lastCommit: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "active", author: { name: "Sahil Vadia" } },
    { id: "b3", name: "fix/TF-99-auth-bug", repositoryId: "r1", lastCommit: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "active", author: { name: "Jane Doe" } },
];

const MOCK_PRS: PullRequest[] = [
    {
        id: "pr1",
        title: "feat: Implement Kanban Board Drag & Drop",
        key: "#45",
        repositoryId: "r1",
        sourceBranch: "feature/TF-101-board-view",
        targetBranch: "main",
        status: "OPEN",
        author: { name: "Sahil Vadia" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        reviewers: [{ name: "Alice Smith", status: "APPROVED" }, { name: "Bob Jones", status: "PENDING" }]
    },
    {
        id: "pr2",
        title: "fix: Login redirect issue",
        key: "#44",
        repositoryId: "r1",
        sourceBranch: "fix/TF-99-auth-bug",
        targetBranch: "main",
        status: "MERGED",
        author: { name: "Jane Doe" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        reviewers: [{ name: "Sahil Vadia", status: "APPROVED" }]
    }
];

const MOCK_COMMITS: Commit[] = [
    { id: "c1", hash: "a1b2c3d", message: "feat: add drag and drop context", author: { name: "Sahil Vadia" }, date: new Date().toISOString(), repositoryId: "r1", branchId: "b2" },
    { id: "c2", hash: "e5f6g7h", message: "style: update board columns", author: { name: "Sahil Vadia" }, date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), repositoryId: "r1", branchId: "b2" },
    { id: "c3", hash: "i8j9k0l", message: "fix: resolve merge conflict", author: { name: "Jane Doe" }, date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), repositoryId: "r1", branchId: "b3" },
];

export const useDevStore = create<DevStore>((set) => ({
    repositories: [],
    branches: [],
    pullRequests: [],
    commits: [],

    fetchData: (projectId: string) => {
        // Simulate API call
        set({
            repositories: MOCK_REPOS,
            branches: MOCK_BRANCHES,
            pullRequests: MOCK_PRS,
            commits: MOCK_COMMITS
        });
    }
}));
