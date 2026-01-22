"use client";

import { use } from "react";
import { ProjectPagesView } from "@/features/projects/components/project-pages-view";

export default function ProjectPagesPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    return (
        <div className="h-[calc(100vh-180px)] border rounded-lg overflow-hidden shadow-sm m-0 bg-background">
            <ProjectPagesView projectId={projectId} />
        </div>
    );
}
