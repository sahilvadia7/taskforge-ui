import { ProjectListView } from "@/features/projects/components/project-list-view";

export default async function ProjectListPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">List View</h2>
                {/* Filter controls can go here */}
            </div>
            <ProjectListView projectId={projectId} />
        </div>
    );
}
