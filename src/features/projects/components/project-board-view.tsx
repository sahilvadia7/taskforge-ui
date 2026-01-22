"use client";

import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    TouchSensor,
    pointerWithin,
    rectIntersection,
    useDroppable,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "../../issues/types";
import { IssueType } from "../../issues/types";
import { IssueFilterBar } from "../../issues/components/issue-filter-bar";
import { useIssues, useUpdateIssue } from "../../issues/hooks/use-issues";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, MoreHorizontal, Trash2, CheckSquare, Bug, Bookmark, LayoutList, AlertCircle, Search, Filter, X, Ban } from "lucide-react";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { useModalStore } from "@/store/use-modal-store";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, getInitials, formatStatus } from "@/lib/utils";
import { BoardSettingsModal } from "@/features/boards/components/board-settings-modal";
import { WorkflowEditor } from "@/features/boards/components/workflow-editor";
import { TransitionConfig, validateTransition } from "@/features/boards/logic/rule-engine";
import { useProject, useProjectMembers, useUpdateProject } from "../hooks/useProjects";
import { toast } from "sonner";
import { ProjectMembersDialog } from "./project-members-dialog";
import { BoardViewSettings, ViewSettingsState } from "./board-view-settings";
import { BoardActionsMenu } from "./board-actions-menu";
import { BoardInsights } from "./board-insights";
import { useMe } from "@/features/users/hooks/use-user";

interface ProjectBoardViewProps {
    projectId: string;
}

const DEFAULT_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function ProjectBoardView({ projectId }: ProjectBoardViewProps) {
    const { data: issues = [], isLoading } = useIssues(projectId);
    const { data: project } = useProject(projectId);
    const { data: members } = useProjectMembers(projectId);
    const { data: currentUser } = useMe();
    const { mutate: updateIssue } = useUpdateIssue();
    const { openCreateIssue, openIssueDetail } = useModalStore();

    // Handle Deep Linking to Issue
    const searchParams = useSearchParams();
    const issueIdParam = searchParams.get("issue");

    useEffect(() => {
        if (issueIdParam) {
            openIssueDetail(issueIdParam);
        }
    }, [issueIdParam, openIssueDetail]);

    const { mutate: updateProject } = useUpdateProject();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<"COLUMN" | "ISSUE" | null>(null);
    const [isDropValid, setIsDropValid] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string | "ALL">("ALL");
    const [selectedTypes, setSelectedTypes] = useState<IssueType[]>([]);
    const [hasSetInitialFilter, setHasSetInitialFilter] = useState(false);

    // Set Default Filter to Current User
    useEffect(() => {
        if (currentUser?.id && !hasSetInitialFilter) {
            setAssigneeFilter(currentUser.id);
            setHasSetInitialFilter(true);
        }
    }, [currentUser, hasSetInitialFilter]);

    // Dynamic Columns State
    const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);

    // Workflow Rules State
    const [transitions, setTransitions] = useState<TransitionConfig[]>([]);

    // View Settings State
    const [viewSettings, setViewSettings] = useState<ViewSettingsState>({
        showKey: true,
        showType: true,
        showPriority: true,
        showAssignee: true,
        showStatus: true
    });

    // Dialog States for Menu Actions
    const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (project?.boardConfig) {
            try {
                const parsed = JSON.parse(project.boardConfig);

                // Case 1: Legacy format (Array of strings)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setStatuses(parsed);
                }
                // Case 2: New format (Object with columns and workflow)
                else if (parsed && typeof parsed === "object") {
                    if (parsed.columns && Array.isArray(parsed.columns)) {
                        setStatuses(parsed.columns);
                    }
                    if (parsed.workflow && Array.isArray(parsed.workflow)) {
                        setTransitions(parsed.workflow);
                    }
                }
                // If backend config exists (even empty object), we trust it and don't fallback to local storage for *that* session usually, 
                // but let's allow fallthrough if it was invalid or empty? 
                // Actually returning here is good if we found valid data.
                if (parsed) return;
            } catch (e) {
                console.error("Failed to parse board config", e);
            }
        }

        // Fallback to LocalStorage (Migration path)
        // Note: This logic only runs if project.boardConfig was empty or invalid
        const savedStatuses = localStorage.getItem(`project_statuses_${projectId}`);
        if (savedStatuses && !project?.boardConfig) {
            try {
                let parsed = JSON.parse(savedStatuses);
                let hasChanges = false;
                const migrated = parsed.map((s: string) => {
                    if (s === "TODO" || s === "IN_PROGRESS" || s === "DONE" || s === "IN_REVIEW") return s;
                    const normalized = s.toUpperCase().replace(/\s+/g, "_");
                    if (normalized === "TO_DO") return "TODO";
                    if (normalized === "IN_PROGRESS" || normalized === "IN_REVIEW" || normalized === "DONE" || normalized === "BACKLOG") {
                        hasChanges = true;
                        return normalized;
                    }
                    return s;
                });

                if (hasChanges) {
                    parsed = migrated;
                    // Auto-save migrated config to Backend if possible, but let's just set state for now
                }
                setStatuses(parsed);
            } catch (e) {
                console.error("Failed to parse board statuses", e);
            }
        }
    }, [projectId, project?.boardConfig]);

    const handleSaveStatuses = useCallback((newStatuses: string[]) => {
        setStatuses(newStatuses);

        // Persist to Backend (Combined Config)
        const configToSave = {
            columns: newStatuses,
            workflow: transitions
        };

        updateProject({
            projectId,
            data: {
                boardConfig: JSON.stringify(configToSave)
            }
        }, {
            onError: (err: unknown) => {
                toast.error("Failed to save board layout");
                console.error(err);
            }
        });
    }, [projectId, updateProject, transitions]);

    const handleSaveWorkflow = useCallback((newTransitions: TransitionConfig[]) => {
        setTransitions(newTransitions);

        // Persist to Backend (Combined Config)
        const configToSave = {
            columns: statuses,
            workflow: newTransitions
        };

        updateProject({
            projectId,
            data: {
                boardConfig: JSON.stringify(configToSave)
            }
        }, {
            onSuccess: () => toast.success("Workflow rules saved to project"),
            onError: () => toast.error("Failed to save workflow rules")
        });
    }, [projectId, updateProject, statuses]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor)
    );

    const issuesByStatus = useMemo(() => {
        const grouped: Record<string, Issue[]> = {};
        statuses.forEach(s => grouped[s] = []);

        const filteredIssues = issues.filter(issue => {
            const matchesSearch = issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.key.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAssignee = assigneeFilter === "ALL" || issue.assignee?.id === assigneeFilter;
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(issue.type);
            return matchesSearch && matchesAssignee && matchesType;
        });

        filteredIssues.forEach(issue => {
            // Try exact match
            if (grouped[issue.status]) {
                grouped[issue.status].push(issue);
            }
            // Try uppercase match (fix for mismatched data cases)
            else if (grouped[issue.status.toUpperCase()]) {
                grouped[issue.status.toUpperCase()].push(issue);
            }
            else {
                // Fallback
                if (!grouped["TODO"]) grouped["TODO"] = [];
                grouped["TODO"].push(issue);
            }
        });
        return grouped;
    }, [issues, statuses, searchQuery, assigneeFilter, selectedTypes]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setIsDropValid(true); // Default to true
        if ((event.active.id as string).startsWith('col-') || (event.active.data.current?.type === "COLUMN")) {
            setActiveType("COLUMN");
        } else {
            setActiveType("ISSUE");
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            setIsDropValid(false);
            return;
        }
        if (activeType !== "ISSUE") return;

        const activeIssueId = active.id as string;
        const activeIssue = issues.find(i => i.id === activeIssueId);
        if (!activeIssue) return;

        let targetStatus = "";
        const overId = over.id as string;

        if (overId.startsWith("col-")) {
            targetStatus = overId.replace("col-", "");
        } else {
            const overIssue = issues.find(i => i.id === overId);
            if (overIssue) {
                targetStatus = overIssue.status;
            }
        }

        // Normalize status
        if (!statuses.includes(targetStatus)) {
            const matchingStatus = statuses.find(s => s.toUpperCase() === targetStatus.toUpperCase());
            if (matchingStatus) targetStatus = matchingStatus;
            else {
                setIsDropValid(false);
                return;
            }
        }

        if (activeIssue.status === targetStatus) {
            setIsDropValid(true);
            return;
        }

        const config = transitions.find(t => t.from === activeIssue.status && t.to === targetStatus);
        const currentUserRole = "ADMIN"; // TODO: Use real role
        const targetColumnCount = issuesByStatus[targetStatus]?.length || 0;
        let wipLimit = undefined;
        if (project?.template === "KANBAN" && targetStatus === "IN_PROGRESS") {
            wipLimit = 3;
        }

        const validation = validateTransition(
            activeIssue,
            targetStatus,
            config,
            { userRole: currentUserRole, targetColumnCount, wipLimit }
        );

        setIsDropValid(validation.allowed);

    }, [activeType, issues, statuses, transitions, issuesByStatus, project?.template]);


    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveType(null);
            return;
        }

        const activeIdStr = active.id as string;
        // Ensure we are checking strictly for ISSUE type drags
        const isIssue = activeType === 'ISSUE' || !activeIdStr.startsWith('col-');

        if (isIssue) {
            const activeIssueId = activeIdStr;
            let targetStatus = "";

            const overId = over.id as string;

            // 1. Determine Target Status
            if (overId.startsWith("col-")) {
                targetStatus = overId.replace("col-", "");
            } else {
                // Dropped on another card
                const overIssue = issues.find(i => i.id === overId);
                if (overIssue) {
                    targetStatus = overIssue.status;
                }
            }

            // Normalize Target Status (Case Insensitive Match)
            if (!statuses.includes(targetStatus)) {
                const matchingStatus = statuses.find(s => s.toUpperCase() === targetStatus.toUpperCase());
                if (matchingStatus) {
                    targetStatus = matchingStatus;
                } else {
                    toast.error("Process Error", {
                        description: `Cannot move to '${targetStatus}': Status not defined in board.`,
                        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
                    });
                    return;
                }
            }

            const activeIssue = issues.find(i => i.id === activeIssueId);

            if (activeIssue && activeIssue.status !== targetStatus) {

                // 3. Find Rule Configuration
                const config = transitions.find(t => t.from === activeIssue.status && t.to === targetStatus);

                // FIX: Change "MEMBER" to "ADMIN" for demo purposes
                const currentUserRole = "ADMIN";

                // Count issues in target column explicitly
                const targetColumnCount = issuesByStatus[targetStatus]?.length || 0;

                // Kanban Rule: Hardcode a WIP limit of 3 for IN_PROGRESS if template is KANBAN
                // In a real app, this would be stored in BoardConfig
                let wipLimit = undefined;
                if (project?.template === "KANBAN" && targetStatus === "IN_PROGRESS") {
                    wipLimit = 3;
                }

                const validation = validateTransition(
                    activeIssue,
                    targetStatus,
                    config,
                    {
                        userRole: currentUserRole,
                        targetColumnCount,
                        wipLimit
                    }
                );

                if (!validation.allowed) {
                    toast.error("Transition Blocked", {
                        description: validation.reason,
                        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
                        duration: 4000,
                    });
                    setActiveId(null);
                    setActiveType(null);
                    return;
                }

                // 4. Perform Update
                updateIssue({
                    issueId: activeIssueId,
                    data: { status: targetStatus as any }
                });

                // Trigger Confetti if moved to DONE
                if (targetStatus === "DONE" || targetStatus === "Done") {
                    setTimeout(() => {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }, 500);
                }
            }
        }

        setActiveId(null);
        setActiveType(null);
    }, [issues, activeType, statuses, transitions, updateIssue, issuesByStatus, project?.template]);

    const activeIssue = useMemo(() => activeId ? issues.find((i) => i.id === activeId) : null, [activeId, issues]);

    const onIssueClick = useCallback((issue: Issue) => {
        openIssueDetail(issue.id);
    }, [openIssueDetail]);

    if (isLoading) {
        return <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-4 px-4 bg-gray-50/50 dark:bg-zinc-900/10">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-muted/50 border border-border/40">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/20 rounded-t-xl">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-3">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </div>
            ))}
        </div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 w-[200px] lg:w-[300px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <IssueFilterBar selectedTypes={selectedTypes} onTypeChange={setSelectedTypes} />
                    </div>
                    {/* Avatar Filter Bar */}
                    <div className="flex items-center -space-x-2 hover:space-x-1 transition-all mr-2">
                        <div
                            className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted hover:z-10 cursor-pointer transition-all ${assigneeFilter === "ALL" ? "ring-2 ring-primary z-20" : "opacity-70 hover:opacity-100"}`}
                            onClick={() => setAssigneeFilter("ALL")}
                            title="All Assignees"
                        >
                            <span className="text-[10px] font-medium text-muted-foreground">ALL</span>
                        </div>
                        {members?.map(member => (
                            <div
                                key={member.userId}
                                className={`relative cursor-pointer hover:z-10 transition-all ${assigneeFilter === member.userId ? "z-20 scale-110" : "opacity-70 hover:opacity-100"}`}
                                onClick={() => setAssigneeFilter(assigneeFilter === member.userId ? "ALL" : member.userId)}
                                title={member.displayName}
                            >
                                <Avatar className={`h-8 w-8 border-2 border-background ${assigneeFilter === member.userId ? "ring-2 ring-primary" : ""}`}>
                                    <AvatarImage src={member.user?.avatarUrl || member.avatarUrl || undefined} />
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {getInitials(member.displayName || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {(searchQuery || assigneeFilter !== "ALL" || selectedTypes.length > 0) && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                    setSearchQuery("");
                                    setAssigneeFilter("ALL");
                                    setSelectedTypes([]);
                                }}
                            >
                                <X className="mr-1 h-3 w-3" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ProjectMembersDialog projectId={projectId} />
                    <BoardInsights projectId={projectId} />
                    <BoardViewSettings settings={viewSettings} onChange={setViewSettings} />
                    <BoardActionsMenu
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onOpenWorkflow={() => setIsWorkflowOpen(true)}
                    />

                    {/* Hidden Dialogs triggered by Menu */}
                    <div className="hidden">
                        <BoardSettingsModal
                            isOpen={isSettingsOpen}
                            onOpenChange={setIsSettingsOpen}
                            currentStatuses={statuses}
                            onSave={handleSaveStatuses}
                        />
                        <WorkflowEditor
                            isOpen={isWorkflowOpen}
                            onOpenChange={setIsWorkflowOpen}
                            statuses={statuses}
                            currentTransitions={transitions}
                            onSave={handleSaveWorkflow}
                        />
                    </div>
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-4 px-4 bg-gray-50/50 dark:bg-zinc-900/10">
                    {statuses.map((status) => {
                        const columnIssues = issuesByStatus[status] || [];
                        const colId = `col-${status}`;

                        // If searching, hide empty columns to simplify view
                        if (searchQuery && columnIssues.length === 0) return null;

                        return (
                            <BoardColumn
                                key={status}
                                id={colId}
                                title={status}
                                count={columnIssues.length}
                                onAddIssue={() => openCreateIssue({ projectId, type: "TASK" })}
                            >
                                <SortableContext items={columnIssues.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {columnIssues.map((issue) => (
                                        <DraggableCard
                                            key={issue.id}
                                            issue={issue}
                                            startSettings={viewSettings}
                                            onClick={onIssueClick}
                                        />
                                    ))}
                                </SortableContext>
                                {columnIssues.length === 0 && (
                                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/10">
                                        <p className="text-xs text-muted-foreground font-medium">No issues</p>
                                    </div>
                                )}
                            </BoardColumn>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeIssue ? (
                        <div className="opacity-90 rotate-2 cursor-grabbing w-[330px]">
                            <IssueCard
                                issue={activeIssue}
                                isOverlay
                                viewSettings={viewSettings}
                                invalid={!isDropValid}
                            />
                        </div>
                    ) : null}
                </DragOverlay>


            </DndContext>
        </div>
    );
}

// --- Subcomponents ---

const BoardColumn = memo(function BoardColumn({ id, title, count, children, onAddIssue }: { id: string; title: string; count: number; children: React.ReactNode, onAddIssue: () => void }) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: "COLUMN",
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-muted/50 border border-border/40"
        >
            <div className="flex items-center justify-between p-4 border-b bg-muted/20 rounded-t-xl group">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-semibold text-sm tracking-tight truncate max-w-[150px]">
                        {formatStatus(title)}
                    </h3>
                    <Badge variant="secondary" className="rounded-sm px-2 font-mono text-xs">
                        {count}
                    </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddIssue}>
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto">
                {children}
            </div>
        </div>
    );
});

interface DraggableCardProps {
    issue: Issue;
    onClick?: (issue: Issue) => void;
    startSettings: ViewSettingsState;
}

const DraggableCard = memo(function DraggableCard({ issue, onClick, startSettings }: DraggableCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: issue.id,
        data: {
            type: "ISSUE",
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition, // Let dnd-kit manage transition
    };

    // Handler to avoid passing anonymous function in render
    const handleClick = useCallback(() => {
        onClick?.(issue);
    }, [onClick, issue]);

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-30">
                <IssueCard issue={issue} viewSettings={startSettings} />
            </div>
        );
    }

    return (
        <div
            id={`issue-card-${issue.id}`}
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={handleClick}
        >
            <IssueCard issue={issue} viewSettings={startSettings} />
        </div>
    );
});

// Helpers
const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "BLOCKER": return "bg-red-700";
        case "CRITICAL": return "bg-red-600";
        case "URGENT": return "bg-orange-600";
        case "HIGH": return "bg-orange-500";
        case "MEDIUM": return "bg-blue-400";
        case "LOW": return "bg-green-400";
        case "LOWEST": return "bg-slate-300";
        default: return "bg-gray-300";
    }
};

const getIssueTypeIcon = (type: string) => {
    switch (type) {
        case "BUG": return <Bug className="w-3.5 h-3.5 text-red-500" />;
        case "STORY": return <Bookmark className="w-3.5 h-3.5 text-green-500" />;
        case "EPIC": return <LayoutList className="w-3.5 h-3.5 text-purple-500" />;
        case "TASK": return <CheckSquare className="w-3.5 h-3.5 text-blue-500" />;
        case "SUB_TASK": return <CheckSquare className="w-3.5 h-3.5 text-gray-500 rounded-full" />;
        default: return <CheckSquare className="w-3.5 h-3.5 text-blue-500" />;
    }
};

const AssigneeAvatar = memo(function AssigneeAvatar({ issue }: { issue: Issue }) {
    const { data: members } = useProjectMembers(issue.projectId);
    const displayName = members?.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee?.displayName || issue.assignee?.name || "?";

    return (
        <Avatar className="h-5 w-5 border border-background cursor-help" title={displayName}>
            <AvatarImage src={issue.assignee?.avatarUrl} />
            <AvatarFallback className="text-[8px]">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
    );
});

const IssueCard = memo(function IssueCard({ issue, isOverlay, viewSettings, invalid }: { issue: Issue; isOverlay?: boolean, viewSettings?: ViewSettingsState, invalid?: boolean }) {
    // Default to true if not provided (for backward compat or safety)
    const showKey = viewSettings?.showKey ?? true;
    const showType = viewSettings?.showType ?? true;
    const showPriority = viewSettings?.showPriority ?? true;
    const showAssignee = viewSettings?.showAssignee ?? true;
    const showStatus = viewSettings?.showStatus ?? true;
    // When overlay, we want a nice shadow and scale.
    // When in list, standard look.
    // NOTE: dnd-kit handles the transform for the list item.

    if (invalid) {
        return (
            <Card className="cursor-grabbing border-red-500 bg-black text-white z-50 opacity-100 flex items-center justify-center h-32 w-full shadow-2xl scale-105 rotate-2">
                <div className="flex flex-col items-center gap-2">
                    <Ban className="h-8 w-8 text-red-500" />
                    <span className="font-bold text-sm">Drop Not Allowed</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`
            cursor-grab 
            ${isOverlay ? 'cursor-grabbing' : ''}
            border-border/60 
            group 
            overflow-hidden
            relative
            ${isOverlay
                ? "shadow-2xl ring-2 ring-primary scale-105 rotate-2 bg-background z-50 opacity-100"
                : "hover:border-primary/50 hover:shadow-sm transition-all duration-200" // Only transition when NOT dragging/overlay
            }
        `}>
            {/* Priority Indicator Stripe */}
            <div className={`h-full w-1 absolute top-0 left-0 ${getPriorityColor(issue.priority)}`} />

            <CardHeader className="p-3 pb-2 space-y-0 pl-4">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {issue.summary}
                        </span>
                        {issue.description && (
                            <span className="text-xs text-muted-foreground line-clamp-2">
                                {issue.description}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-1 pl-4">
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        {showType && getIssueTypeIcon(issue.type)}
                        {showKey && (
                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                {issue.key}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {showStatus && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                {formatStatus(issue.status)}
                            </Badge>
                        )}
                        {showPriority && (
                            <Badge
                                variant={issue.priority === "HIGH" || issue.priority === "URGENT" || issue.priority === "CRITICAL" || issue.priority === "BLOCKER" ? "destructive" : "outline"}
                                className="text-[10px] px-1.5 py-0 h-5 shadow-none"
                            >
                                {issue.priority}
                            </Badge>
                        )}

                        {/* Assignee Avatar (Small) */}
                        {showAssignee && issue.assignee && (
                            <AssigneeAvatar issue={issue} />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
