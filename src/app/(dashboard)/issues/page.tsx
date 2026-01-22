"use client";

import { ProjectListView } from "@/features/projects/components/project-list-view";

export default function GlobalIssuesPage() {
    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">All Issues</h1>
                    <p className="text-muted-foreground">View and manage all issues in your organization.</p>
                </div>
            </div>
            {/* Displaying all issues in the tenant */}
            <ProjectListView mode="ALL" />
        </div>
    );
}
