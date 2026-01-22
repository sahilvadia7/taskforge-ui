"use client";

import { useIssues, useUpdateIssue, useMoveIssue } from "@/features/issues/hooks/use-issues";
import { useSprints } from "@/features/issues/hooks/use-sprints";
import { CreateSprintModal } from "./create-sprint-modal";
import { MoreHorizontal, GripVertical, ChevronRight, ChevronDown, ListTodo, Star } from "lucide-react";
import { useProjectMembers } from "../hooks/useProjects";
import { Issue } from "@/features/issues/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { StartSprintModal } from "@/features/sprints/components/start-sprint-modal";
import { useModalStore } from "@/store/use-modal-store";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,

} from "@/components/ui/collapsible";
import { Spinner, PageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { IssueFilterBar } from "../../issues/components/issue-filter-bar";
import { IssueType } from "../../issues/types";

interface ProjectBacklogViewProps {
    projectId: string;
}

export function ProjectBacklogView({ projectId }: ProjectBacklogViewProps) {
    const { data: rawIssues, isLoading: issuesLoading } = useIssues(projectId);
    const { sprints, isLoading: sprintsLoading } = useSprints(projectId);
    const { openIssueDetail } = useModalStore();
    const { mutateAsync: moveIssue } = useMoveIssue();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<IssueType[]>([]);

    // Filter Issues
    const issues = rawIssues?.filter(issue => {
        if (selectedTypes.length > 0 && !selectedTypes.includes(issue.type)) return false;
        return true;
    });

    // State for collapsible sprints (default all open)
    const [openSprints, setOpenSprints] = useState<Record<string, boolean>>({});

    const toggleSprint = (sprintId: string) => {
        setOpenSprints(prev => ({
            ...prev,
            [sprintId]: prev[sprintId] === undefined ? false : !prev[sprintId] // Default open logic inverted? Let's assume default is OPEN.
        }));
    };

    // Helper to check if open (default true)
    const isSprintOpen = (id: string) => openSprints[id] !== false;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (issuesLoading || sprintsLoading) {
        return (
            <div className="h-full flex flex-col p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const backlogIssues = issues?.filter((issue) => !issue.sprintId && issue.status !== "DONE" && issue.status !== "CLOSED") || [];

    // Group issues by sprint
    const sprintIssues = sprints?.reduce((acc, sprint) => {
        acc[sprint.id] = issues?.filter((issue) => issue.sprintId === sprint.id) || [];
        return acc;
    }, {} as Record<string, Issue[]>) || {};


    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIssueId = active.id as string;
        const overId = over.id as string;

        // Skip if dropping on self
        if (activeIssueId === overId) return;

        // Determine destination container
        let destinationSprintId: string | undefined = undefined; // undefined means backlog
        let isBacklog = false;

        if (overId === "backlog") {
            isBacklog = true;
            destinationSprintId = undefined;
        } else if (sprints?.find(s => s.id === overId)) {
            // Dropped on Sprint Container
            destinationSprintId = overId;
        } else {
            // Dropped on Issue?
            const overIssue = issues?.find(i => i.id === overId);
            if (overIssue) {
                destinationSprintId = overIssue.sprintId || undefined;
                if (!destinationSprintId) isBacklog = true;
            } else {
                return; // Unknown
            }
        }

        // Determine Target Index in the list
        // Get sorted list of issues in target container
        const targetList = issues?.filter(i => {
            if (destinationSprintId) return i.sprintId === destinationSprintId;
            return !i.sprintId && i.status !== "DONE" && i.status !== "CLOSED";
        }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        // If dropped on container (activeType checks or container checks)
        // If 'over' is the container ID, we usually append to end or top.
        // dnd-kit strategy: if over container, append.
        let targetIndex = 0;

        if (overId === destinationSprintId || (overId === "backlog" && isBacklog)) {
            // Dropped on container -> append
            targetIndex = targetList.length;
        } else {
            // Dropped on item
            const overIndex = targetList.findIndex(i => i.id === overId);
            targetIndex = overIndex >= 0 ? overIndex : 0;
        }

        await moveIssue({
            issueId: activeIssueId,
            sprintId: destinationSprintId || null,
            targetIndex: targetIndex
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">Backlog</h1>
                        <IssueFilterBar selectedTypes={selectedTypes} onTypeChange={setSelectedTypes} />
                    </div>
                    <div className="flex gap-2">
                        <CreateSprintModal projectId={projectId} />
                    </div>
                </div>

                <div className="space-y-6">
                    {sprints?.map((sprint) => (
                        <Collapsible
                            key={sprint.id}
                            open={isSprintOpen(sprint.id)}
                            onOpenChange={() => toggleSprint(sprint.id)}
                            className="border rounded-lg bg-card"
                        >
                            <div className="flex items-center justify-between p-4 bg-card rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6 hover:bg-muted">
                                            {isSprintOpen(sprint.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg cursor-pointer" onClick={() => toggleSprint(sprint.id)}>{sprint.name}</h3>
                                            <Badge variant={sprint.status === "ACTIVE" ? "default" : "secondary"}>{sprint.status}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                ({sprintIssues[sprint.id]?.length || 0} issues)
                                            </span>
                                        </div>
                                        {sprint.goal && <p className="text-sm text-muted-foreground ml-8">{sprint.goal}</p>}
                                    </div>
                                </div>
                                <StartSprintModal projectId={projectId} sprint={sprint} />
                            </div>

                            <CollapsibleContent>
                                <div className="p-4 pt-0">
                                    <DroppableContainer id={sprint.id} className="space-y-2 min-h-[50px]">
                                        <SortableContext
                                            id={sprint.id}
                                            items={sprintIssues[sprint.id]?.map(i => i.id) || []}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {(sprintIssues[sprint.id] || []).map(issue => (
                                                <SortableIssueItem
                                                    key={issue.id}
                                                    issue={issue}
                                                    onClick={() => openIssueDetail(issue.id)}
                                                />
                                            ))}
                                            {(sprintIssues[sprint.id] || []).length === 0 && (
                                                <div className="text-center py-8 border-2 border-dashed rounded-lg border-muted/50">
                                                    <p className="text-sm text-muted-foreground">Plan empty. Drop issues here to plan.</p>
                                                </div>
                                            )}
                                        </SortableContext>
                                    </DroppableContainer>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}

                    <div className="border rounded-lg p-4 bg-muted/30">
                        <h3 className="font-semibold text-lg mb-4">Backlog ({backlogIssues.length} issues)</h3>
                        <DroppableContainer id="backlog" className="space-y-2 min-h-[100px]">
                            <SortableContext
                                id="backlog"
                                items={backlogIssues.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {backlogIssues.map(issue => (
                                    <SortableIssueItem
                                        key={issue.id}
                                        issue={issue}
                                        onClick={() => openIssueDetail(issue.id)}
                                    />
                                ))}
                                {backlogIssues.length === 0 && (
                                    <EmptyState
                                        title="Backlog is empty"
                                        description="Create new issues to populate the backlog."
                                        icon={ListTodo}
                                        className="py-12"
                                    />
                                )}
                            </SortableContext>
                        </DroppableContainer>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="p-3 bg-background border rounded-md shadow-lg opacity-80 cursor-grabbing">
                            <span className="font-medium">Moving Issue...</span>
                        </div>
                    ) : null}
                </DragOverlay>

            </div>
        </DndContext>
    );
}

function SortableIssueItem({ issue, onClick }: { issue: Issue, onClick: () => void }) {
    const { data: members } = useProjectMembers(issue.projectId);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: issue.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // We apply listeners only to the drag handle if we want, or whole item.
            // Let's do drag handle for better UX if clicking opens details.
            className="flex items-center justify-between p-3 bg-background border rounded-md shadow-sm hover:border-blue-300 transition-colors group"
        >
            <div className="flex items-center gap-3 flex-1">
                <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                </div>
                <div onClick={onClick} className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Badge variant="outline">{issue.key}</Badge>
                    <span className="font-medium truncate">{issue.summary}</span>
                    {issue.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    <Badge variant={issue.priority === "HIGH" || issue.priority === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px] h-5">{issue.priority}</Badge>
                    {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                        <Badge variant="outline" className="text-[10px] h-5 font-mono bg-muted/50">
                            {issue.storyPoints}
                        </Badge>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {issue.assignee ? (
                    <Avatar className="h-6 w-6 cursor-help" title={members?.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee.name}>
                        <AvatarImage src={issue.assignee.avatarUrl} />
                        <AvatarFallback className="text-[10px] bg-muted flex items-center justify-center">
                            {getInitials(members?.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee.name)}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground" title="Unassigned">
                        ?
                    </div>
                )}
            </div>
        </div>
    );
}

function DroppableContainer({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}
