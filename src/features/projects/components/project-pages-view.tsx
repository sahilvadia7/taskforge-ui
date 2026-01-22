"use client";

import { useEffect } from "react";
import { usePageStore } from "@/store/use-page-store";
import { PageTreeSidebar } from "@/features/pages/components/page-tree-sidebar";
import { PageEditor } from "@/features/pages/components/page-editor";

interface ProjectPagesViewProps {
    projectId: string;
}

export function ProjectPagesView({ projectId }: ProjectPagesViewProps) {
    const { fetchPages } = usePageStore();

    useEffect(() => {
        fetchPages(projectId);
    }, [projectId, fetchPages]);

    return (
        <div className="flex h-full bg-background">
            <PageTreeSidebar projectId={projectId} />
            <PageEditor />
        </div>
    );
}
