import { create } from "zustand";
import { pagesApi, CreatePageRequest, UpdatePageRequest } from "@/features/pages/api";
import { toast } from "sonner";

export interface Page {
    id: string;
    title: string;
    content: string; // Markdown or HTML
    parentId: string | null;
    projectId: string;
    icon?: string; // Emoji
    createdAt: string;
    updatedAt: string;
    children?: Page[]; // For recursive rendering if needed
}

interface PageStore {
    pages: Page[];
    selectedPageId: string | null;
    expandedNodes: string[]; // IDs of expanded folders in tree
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPages: (projectId: string) => Promise<void>;
    createPage: (projectId: string, page: Omit<CreatePageRequest, "projectId">) => Promise<void>;
    updatePage: (id: string, fields: UpdatePageRequest) => Promise<void>;
    deletePage: (id: string) => Promise<void>;
    setSelectedPageId: (id: string | null) => void;
    toggleNode: (id: string) => void;
}

export const usePageStore = create<PageStore>((set, get) => ({
    pages: [],
    selectedPageId: null,
    expandedNodes: [],
    isLoading: false,
    error: null,

    fetchPages: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const pages = await pagesApi.getPages(projectId);

            // If we have pages and no selected page, select the first one (or welcome page if we had logic for that)
            // But usually we might want to let the UI decide or select "overview"

            set({ pages, isLoading: false });
        } catch {
            set({ error: "Failed to load pages", isLoading: false });
        }
    },

    createPage: async (projectId, pageData) => {
        set({ isLoading: true, error: null });
        try {
            const newPage = await pagesApi.createPage(projectId, { ...pageData, projectId });
            set((state) => ({
                pages: [...state.pages, newPage],
                selectedPageId: newPage.id,
                isLoading: false
            }));
            toast.success("Page created");
        } catch {
            set({ error: "Failed to create page", isLoading: false });
            toast.error("Failed to create page");
        }
    },

    updatePage: async (id, fields) => {
        // Optimistic update? Or wait? Let's wait for simplicity first, or partial optimistic.
        // Doing simple wait pattern.
        try {
            const updatedPage = await pagesApi.updatePage(id, fields);
            set((state) => ({
                pages: state.pages.map((p) => p.id === id ? updatedPage : p)
            }));
        } catch {
            toast.error("Failed to save changes");
        }
    },

    deletePage: async (id) => {
        try {
            await pagesApi.deletePage(id);
            set((state) => ({
                pages: state.pages.filter(p => p.id !== id),
                selectedPageId: state.selectedPageId === id ? null : state.selectedPageId
            }));
            toast.success("Page deleted");
        } catch {
            toast.error("Failed to delete page");
        }
    },

    setSelectedPageId: (id) => set({ selectedPageId: id }),

    toggleNode: (id) => set((state) => {
        if (state.expandedNodes.includes(id)) {
            return { expandedNodes: state.expandedNodes.filter(n => n !== id) };
        } else {
            return { expandedNodes: [...state.expandedNodes, id] };
        }
    }),
}));
