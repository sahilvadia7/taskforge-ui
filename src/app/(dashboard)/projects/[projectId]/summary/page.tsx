import { ProjectSummaryView } from "@/features/projects/components/project-summary-view";

export default async function ProjectSummaryPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Project Summary</h2>
            <ProjectSummaryView projectId={projectId} />
        </div>
    );
}
