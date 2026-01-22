"use client";

import { use } from "react";
import { ProjectTimelineView } from "@/features/projects/components/project-timeline-view";

interface ProjectTimelinePageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default function ProjectTimelinePage({ params }: ProjectTimelinePageProps) {
    const { projectId } = use(params);

    return <ProjectTimelineView projectId={projectId} />;
}
