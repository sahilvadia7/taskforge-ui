"use client";

import { use } from "react";
import { ProjectBacklogView } from "@/features/projects/components/project-backlog-view";

interface ProjectBacklogPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default function ProjectBacklogPage({ params }: ProjectBacklogPageProps) {
    const { projectId } = use(params);

    return <ProjectBacklogView projectId={projectId} />;
}
