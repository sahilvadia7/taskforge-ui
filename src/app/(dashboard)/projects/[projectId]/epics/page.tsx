import { EpicsListView } from "@/features/issues/components/epics-list-view";

export default async function EpicsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Epics</h2>
            </div>
            <EpicsListView projectId={projectId} />
        </div>
    );
}
