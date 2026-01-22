import { ProjectBoardView } from "@/features/projects/components/project-board-view";

export default async function ProjectBoardPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div className="h-[calc(100vh-180px)]">
            {/* 180px accounts for header, tabs, and padding */}
            <ProjectBoardView projectId={projectId} />
        </div>
    );
}
