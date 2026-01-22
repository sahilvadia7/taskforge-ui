import { create } from "zustand";

import { IssueType } from "@/features/issues/types";

interface ModalStore {
    isCreateIssueOpen: boolean;
    issueDefaults: {
        dueDate?: string;
        projectId?: string;
        startDate?: string;
        type?: IssueType;
        parentId?: string;
    } | null;
    openCreateIssue: (defaults?: { dueDate?: string; projectId?: string; startDate?: string; type?: IssueType; parentId?: string }) => void;
    closeCreateIssue: () => void;
    toggleCreateIssue: () => void;
    isCreateProjectOpen: boolean;
    openCreateProject: () => void;
    closeCreateProject: () => void;
    toggleCreateProject: () => void;
    isCreateTenantOpen: boolean;
    openCreateTenant: () => void;
    closeCreateTenant: () => void;
    // Global Issue Detail
    selectedIssueId: string | null;
    isIssueDetailOpen: boolean;
    openIssueDetail: (issueId: string) => void;
    closeIssueDetail: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    isCreateIssueOpen: false,
    issueDefaults: null,
    openCreateIssue: (defaults) => set({ isCreateIssueOpen: true, issueDefaults: defaults || null }),
    closeCreateIssue: () => set({ isCreateIssueOpen: false, issueDefaults: null }),
    toggleCreateIssue: () => set((state) => ({ isCreateIssueOpen: !state.isCreateIssueOpen, issueDefaults: null })),
    isCreateProjectOpen: false,
    openCreateProject: () => set({ isCreateProjectOpen: true }),
    closeCreateProject: () => set({ isCreateProjectOpen: false }),
    toggleCreateProject: () => set((state) => ({ isCreateProjectOpen: !state.isCreateProjectOpen })),
    isCreateTenantOpen: false,
    openCreateTenant: () => set({ isCreateTenantOpen: true }),
    closeCreateTenant: () => set({ isCreateTenantOpen: false }),
    // Global Issue Detail
    selectedIssueId: null,
    isIssueDetailOpen: false,
    openIssueDetail: (issueId: string) => set({ isIssueDetailOpen: true, selectedIssueId: issueId }),
    closeIssueDetail: () => set({ isIssueDetailOpen: false, selectedIssueId: null }),
}));
