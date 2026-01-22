"use client";

import { use } from "react";
import { ProjectListView } from "@/features/projects/components/project-list-view";

interface ProjectIssuesPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default function ProjectIssuesPage({ params }: ProjectIssuesPageProps) {
    const { projectId } = use(params);

    // Reuse List view for now, usually would have more filters
    return (
        <div className="h-full flex flex-col space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">All Issues</h2>
            <ProjectListView projectId={projectId} />
        </div>
    );
}
