"use client";

import { use } from "react";
import { ProjectCalendarView } from "@/features/projects/components/project-calendar-view";

export default function ProjectCalendarPage({ params }: { params: Promise<{ projectId: string }>; }) {
    const { projectId } = use(params);
    return (
        <div className="h-[calc(100vh-180px)] border rounded-lg overflow-hidden shadow-sm m-0 bg-background">
            <ProjectCalendarView projectId={projectId} />
        </div>
    );
}
