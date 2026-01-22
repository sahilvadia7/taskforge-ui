import { create } from "zustand";
import { generateMockIssues, MOCK_ISSUES } from "@/features/issues/utils/mock-data";
import { Issue } from "@/features/issues/types";

interface IssueStore {
    issues: Issue[];
    selectedIssue: Issue | null;
    initializeIssues: (projectId: string) => void;
    setSelectedIssue: (issue: Issue | null) => void;
    createIssue: (issue: Partial<Issue>) => void;
    updateIssue: (issueId: string, updates: Partial<Issue>) => void;
    deleteIssue: (issueId: string) => void;
}

export const useIssueStore = create<IssueStore>((set) => ({
    issues: [],
    selectedIssue: null,

    initializeIssues: (projectId: string) => {
        // Mock data initialization
        const mocks = generateMockIssues(projectId, 15);
        set({ issues: mocks });
    },

    setSelectedIssue: (issue) => set({ selectedIssue: issue }),

    createIssue: (issueData) => set((state) => {
        const newIssue: Issue = {
            id: `ISSUE-${Date.now()}`,
            key: `PROJ-${Math.floor(Math.random() * 1000)}`,
            summary: issueData.summary || "New Issue",
            type: issueData.type || "Task",
            status: issueData.status || "To Do",
            priority: issueData.priority || "Medium",
            assignee: issueData.assignee || undefined,
            reporter: { id: "u1", name: "Me", avatarUrl: "" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            projectId: issueData.projectId || "menu",
            description: issueData.description || "",
            ...issueData
        } as Issue;

        return { issues: [...state.issues, newIssue] };
    }),

    updateIssue: (issueId, updates) => set((state) => ({
        issues: state.issues.map(i => i.id === issueId ? { ...i, ...updates } : i),
        selectedIssue: state.selectedIssue?.id === issueId ? { ...state.selectedIssue, ...updates } : state.selectedIssue
    })),

    deleteIssue: (issueId) => set((state) => ({
        issues: state.issues.filter(i => i.id !== issueId),
        selectedIssue: state.selectedIssue?.id === issueId ? null : state.selectedIssue
    })),
}));
