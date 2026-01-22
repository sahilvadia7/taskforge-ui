"use client";

import { Issue, IssuePriority, IssueStatus, ActivityItem, IssueHistory as IssueHistoryType, Comment as CommentType, WorkLog as WorkLogType } from "@/features/issues/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    X,
    Link,
    MoreHorizontal,
    Share2,
    Eye,
    Paperclip,
    CheckSquare,
    Plus,
    Calendar,
    Bug,
    Bookmark,
    LayoutList,
    Loader2,
    Star,
    History,
    MessageSquare,
    Clock,
    BarChart2,
    PieChart,
    ChevronRight,
    ArrowUpRight,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getInitials, formatStatus } from "@/lib/utils";
import { format } from "date-fns";
import {
    useUpdateIssue,
    useDeleteIssue,
    useIssue,
    useIssues,
    useIssueComments,
    useAddComment,
    useIssueHistory,
    useIssueWorkLogs,
    useAddWorkLog,
    useIssueActivity
} from "@/features/issues/hooks/use-issues";
import { useProjectMembers } from "@/features/projects/hooks/useProjects";
import { toast } from "sonner";
import { useModalStore } from "@/store/use-modal-store";
import { useMe } from "@/features/users/hooks/use-user";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";

// Use constants or fetch from API if available. For now constants.
const STATUSES: IssueStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "IN_TESTING", "DONE", "BLOCKED", "CLOSED"];
const PRIORITIES: IssuePriority[] = ["BLOCKER", "CRITICAL", "URGENT", "HIGH", "MEDIUM", "LOW", "LOWEST"];

export function IssueDetailModal() {
    const { isIssueDetailOpen, selectedIssueId, closeIssueDetail, openIssueDetail, openCreateIssue } = useModalStore();
    const { data: issue, isLoading } = useIssue(selectedIssueId || "");
    const { data: parentIssue } = useIssue(issue?.parentId || "");
    const { data: projectMembers = [] } = useProjectMembers(issue?.projectId || "");
    const { data: currentUser } = useMe();
    const { mutateAsync: updateIssue } = useUpdateIssue();
    const { mutate: deleteIssue } = useDeleteIssue();

    // New Hooks
    const { data: comments = [] } = useIssueComments(selectedIssueId || "");
    const { mutateAsync: addComment } = useAddComment();
    const { data: history = [] } = useIssueHistory(selectedIssueId || "");
    const { data: workLogs = [] } = useIssueWorkLogs(selectedIssueId || "");
    const { data: activity = [] } = useIssueActivity(selectedIssueId || "");
    const { mutateAsync: addWorkLog } = useAddWorkLog();

    // Fetch potential parents
    const { data: projectIssues = [] } = useIssues(issue?.projectId || "");

    const availableParents = projectIssues.filter(p => {
        if (!issue) return false;
        if (p.id === issue.id) return false; // Cannot be own parent
        if (issue.type === "STORY") return p.type === "EPIC";
        if (issue.type === "TASK" || issue.type === "BUG") return p.type === "STORY";
        return false;
    });

    const handleParentChange = async (newParentId: string) => {
        if (!issue || !selectedIssueId) return;
        const parentId = newParentId === "none" ? null : newParentId;
        await updateIssue({ issueId: selectedIssueId, data: { parentId: parentId || undefined } });
        toast.success("Parent updated");
    };

    // Local state for UI
    const [activeTab, setActiveTab] = useState<"comments" | "history" | "worklog">("comments");

    const [commentText, setCommentText] = useState("");
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [isChildrenOpen, setIsChildrenOpen] = useState(false);

    // Work Log State
    const [workLogTime, setWorkLogTime] = useState("");
    const [workLogDesc, setWorkLogDesc] = useState("");

    // Editable state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [storyPoints, setStoryPoints] = useState<string>("");

    useEffect(() => {
        if (issue) {
            setTitle(issue.summary);
            setDescription(issue.description || "");
            setStoryPoints(issue.storyPoints?.toString() || "");
        }
    }, [issue]);

    const handleStatusChange = async (newStatus: IssueStatus) => {
        if (!issue || !selectedIssueId) return;
        await updateIssue({ issueId: selectedIssueId, data: { status: newStatus } });
        toast.success("Status updated");
    };

    const handlePriorityChange = async (newPriority: IssuePriority) => {
        if (!issue || !selectedIssueId) return;
        await updateIssue({ issueId: selectedIssueId, data: { priority: newPriority } });
        toast.success("Priority updated");
    };

    const handleAssigneeChange = async (newAssigneeId: string) => {
        if (!issue || !selectedIssueId) return;
        const assigneeId = newAssigneeId === "unassigned" ? undefined : newAssigneeId;
        await updateIssue({ issueId: selectedIssueId, data: { assigneeId } });
        toast.success("Assignee updated");
    };

    const handleTitleSave = async () => {
        if (!issue || !selectedIssueId) return;
        if (title !== issue.summary) {
            await updateIssue({ issueId: selectedIssueId, data: { title } });
            toast.success("Title updated");
        }
    };

    const handleDescriptionSave = async () => {
        if (!issue || !selectedIssueId) return;
        if (description !== issue.description) {
            await updateIssue({ issueId: selectedIssueId, data: { description } });
            toast.success("Description updated");
        }
    };

    const handleStoryPointsSave = async () => {
        if (!issue || !selectedIssueId) return;
        const points = storyPoints === "" ? undefined : parseFloat(storyPoints);
        if (points !== issue.storyPoints) {
            // Validate number
            if (storyPoints !== "" && isNaN(parseFloat(storyPoints))) {
                toast.error("Story points must be a number");
                return;
            }

            // Validation: Check if new budget is less than allocated
            if (issue.type === "EPIC" && points !== undefined) {
                // We need to calculate allocated here or ensure we have access to it.
                // Re-calculating for safety as state might be stale? 
                // Actually `projectIssues` is available here.
                const getDescendants = (rootId: string) => {
                    const children = projectIssues.filter(i => i.parentId === rootId);
                    let descendants = [...children];
                    children.forEach(child => {
                        descendants = [...descendants, ...getDescendants(child.id)];
                    });
                    return descendants;
                };
                const descendants = getDescendants(issue.id);
                const currentAllocated = descendants.reduce((acc, i) => acc + (i.storyPoints || 0), 0);

                if (points < currentAllocated) {
                    toast.warning(`Warning: New budget (${points}) is less than currently allocated points (${currentAllocated}).`);
                }
            }

            await updateIssue({ issueId: selectedIssueId, data: { storyPoints: points } });
            toast.success("Story points updated");
        }
    }

    const handleDelete = () => {
        if (!issue) return;
        if (confirm("Are you sure you want to delete this issue?")) {
            deleteIssue(issue.id, {
                onSuccess: () => {
                    toast.success("Issue deleted");
                    closeIssueDetail();
                }
            });
        }
    };

    const handleSaveComment = async () => {
        if (!commentText.trim() || !issue || !selectedIssueId) return;
        try {
            await addComment({ issueId: selectedIssueId, text: commentText });
            toast.success("Comment added");
            setCommentText("");
        } catch (e) {
            toast.error("Failed to add comment");
        }
    };

    const handleSaveWorkLog = async () => {
        if (!workLogTime.trim() || !issue || !selectedIssueId) return;
        try {
            const minutes = parseInt(workLogTime);
            if (isNaN(minutes)) {
                toast.error("Time must be in minutes (integer)");
                return;
            }
            await addWorkLog({
                issueId: selectedIssueId,
                data: {
                    timeSpentMinutes: minutes,
                    description: workLogDesc,
                    startedAt: new Date().toISOString()
                }
            });
            toast.success("Work log added");
            setWorkLogTime("");
            setWorkLogDesc("");
        } catch (e) {
            toast.error("Failed to log work");
        }
    }

    if (!isIssueDetailOpen) return null;

    const getIssueTypeColor = (type: string) => {
        switch (type) {
            case "BUG": return "bg-red-100 text-red-600";
            case "STORY": return "bg-green-100 text-green-600";
            case "EPIC": return "bg-purple-100 text-purple-600";
            default: return "bg-blue-100 text-blue-600";
        }
    };

    const getIssueTypeIcon = (type: string) => {
        switch (type) {
            case "BUG": return <Bug className="h-3 w-3" />;
            case "STORY": return <Bookmark className="h-3 w-3" />;
            case "EPIC": return <LayoutList className="h-3 w-3" />;
            default: return <CheckSquare className="h-3 w-3" />;
        }
    };

    // Derived State
    const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedWorkLogs = [...workLogs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    // Calculate total time
    const totalMinutes = workLogs.reduce((acc, log) => acc + log.timeSpentMinutes, 0);
    const formatMinutes = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    };

    // Aggregation Logic for Progress Modal
    // Recursive function to get all descendants
    const getDescendants = (rootId: string): Issue[] => {
        const children = projectIssues.filter(i => i.parentId === rootId);
        let descendants = [...children];
        children.forEach(child => {
            descendants = [...descendants, ...getDescendants(child.id)];
        });
        return descendants;
    };

    const allDescendants = getDescendants(issue?.id || "");
    const allRelatedIssues = [issue, ...allDescendants].filter((i): i is Issue => !!i);

    // 1. Story Points: Budget vs Allocated
    // Budget = The Story Points set on THIS issue (if it is a container like Epic)
    // Allocated = The sum of Story Points of all descendants
    const budgetStoryPoints = issue?.storyPoints || 0;
    const allocatedStoryPoints = allDescendants.reduce((acc, i) => acc + (i.storyPoints || 0), 0);

    // Total for "Completed" calculation (includes own + descendants)
    const totalScopeStoryPoints = budgetStoryPoints > 0 ? budgetStoryPoints : allocatedStoryPoints; // Use budget if set, else sum

    const completedStoryPoints = allRelatedIssues
        .filter(i => i.status === "DONE" || i.status === "CLOSED" || i.status === "RESOLVED")
        .reduce((acc, i) => acc + (i.storyPoints || 0), 0);

    // 2. Total Time Logged
    // For now, using current issue's log. ideally we sum up descendants too if data available.
    // If projectIssues contains workLogs (unlikely in list view), we could sum it.
    // We will stick to current + maybe children if available.
    const totalLoggedMinutes = totalMinutes;

    // 3. Status Counts
    const statusCounts = allRelatedIssues.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading || !selectedIssueId || !issue) {
        return (
            <Dialog open={isIssueDetailOpen} onOpenChange={(o) => !o && closeIssueDetail()}>
                <DialogContent className="max-w-[95vw] w-full sm:max-w-[95vw] md:max-w-5xl h-[95vh] md:h-[90vh] p-0 flex flex-col gap-0 bg-background overflow-hidden outline-none">
                    <DialogTitle className="sr-only">Loading</DialogTitle>
                    {/* Skeleton Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background z-10">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const handleStarToggle = async () => {
        if (!issue || !selectedIssueId) return;
        const newStarred = !issue.starred;
        await updateIssue({ issueId: selectedIssueId, data: { starred: newStarred } });
        toast.success(newStarred ? "Issue starred" : "Issue unstarred");
    };

    // Progress Modal Component
    const ProgressModal = () => (
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
            <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 p-0 overflow-hidden gap-0">
                <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        Summary Panel
                    </DialogTitle>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* 0. Context / Hierarchy */}
                    {(parentIssue || issue) && (
                        <div className="flex items-center gap-2 text-sm border-b pb-4">
                            <span className="text-muted-foreground font-medium">Context:</span>
                            <div className="flex items-center gap-2">
                                {parentIssue ? (
                                    <>
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:underline"
                                            onClick={() => {
                                                setShowProgressModal(false);
                                                openIssueDetail(parentIssue.id);
                                            }}
                                        >
                                            <span className={cn("w-4 h-4 rounded flex items-center justify-center scale-90", getIssueTypeColor(parentIssue.type))}>
                                                {getIssueTypeIcon(parentIssue.type)}
                                            </span>
                                            <span className="font-medium text-muted-foreground">{parentIssue.key}</span>
                                        </div>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    </>
                                ) : null}
                                <div className="flex items-center gap-1">
                                    <span className={cn("w-4 h-4 rounded flex items-center justify-center scale-90", getIssueTypeColor(issue?.type || "STORY"))}>
                                        {getIssueTypeIcon(issue?.type || "STORY")}
                                    </span>
                                    <span className="font-semibold text-foreground">{issue?.key}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 1. Time Tracking */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Time Tracking
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">1 SP = 8h</span>
                        </div>

                        <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                            {/* Progress Bar */}
                            <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${Math.min(100, (totalLoggedMinutes / (Math.max(1, totalScopeStoryPoints) * 480)) * 100)}%` }}
                            />
                            {/* Marker for "Original Estimate" could be placed here if we had detailed estimate vs SP */}
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <div>
                                <b className="text-foreground">{formatMinutes(totalLoggedMinutes)}</b> logged
                            </div>
                            <div>
                                <b className="text-foreground">{formatMinutes(Math.max(0, (totalScopeStoryPoints * 480) - totalLoggedMinutes))}</b> remaining
                            </div>
                            <div>
                                <b className="text-foreground">{formatMinutes(totalScopeStoryPoints * 480)}</b> estimated
                            </div>
                        </div>
                    </div>

                    {/* 2. Story Points Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Bookmark className="h-4 w-4" /> Story Points
                                <span className="text-xs font-normal text-muted-foreground">(includes {allDescendants.length} sub-issues)</span>
                            </span>
                            <div className="text-right">
                                <span className={cn("text-foreground", allocatedStoryPoints > budgetStoryPoints && budgetStoryPoints > 0 ? "text-red-600 font-bold" : "")}>
                                    {allocatedStoryPoints}
                                </span>
                                <span className="text-muted-foreground"> / {budgetStoryPoints > 0 ? budgetStoryPoints : "-"} (Budget)</span>
                            </div>
                        </div>

                        {/* Allocations vs Budget Bar */}
                        {budgetStoryPoints > 0 && (
                            <div className="space-y-1">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
                                    {/* Allocated Bar */}
                                    <div
                                        className={cn("h-full transition-all", allocatedStoryPoints > budgetStoryPoints ? "bg-red-500" : "bg-blue-500")}
                                        style={{ width: `${Math.min(100, (allocatedStoryPoints / budgetStoryPoints) * 100)}%` }}
                                    />
                                    {/* Line Marker for Budget (if we wanted to show over-allocation past 100%) - simplified for now */}
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Allocated: {allocatedStoryPoints}</span>
                                    <span>Budget: {budgetStoryPoints}</span>
                                </div>
                            </div>
                        )}

                        {/* Completion Progress */}
                        <div className="pt-2 border-t mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Completion</span>
                                <span>{completedStoryPoints} / {Math.max(allocatedStoryPoints, budgetStoryPoints)}</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${Math.max(1, Math.max(allocatedStoryPoints, budgetStoryPoints)) > 0 ? (completedStoryPoints / Math.max(allocatedStoryPoints, budgetStoryPoints)) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Collapsible Children List */}
                        {allDescendants.length > 0 && (
                            <Collapsible
                                open={isChildrenOpen}
                                onOpenChange={setIsChildrenOpen}
                                className="border rounded-md bg-muted/10 mt-4"
                            >
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-xs font-medium hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span>View {allDescendants.length} Contributing Issues</span>
                                    </div>
                                    {isChildrenOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 p-2 border-t">
                                    {allDescendants.map(child => (
                                        <div
                                            key={child.id}
                                            onClick={() => {
                                                setShowProgressModal(false);
                                                openIssueDetail(child.id);
                                            }}
                                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer group transition-colors"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0 opacity-80", getIssueTypeColor(child.type))}>
                                                    {getIssueTypeIcon(child.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium truncate max-w-[200px]">{child.summary}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{child.key}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {child.storyPoints && (
                                                    <Badge variant="outline" className="text-[10px] px-1 h-5">{child.storyPoints}</Badge>
                                                )}
                                                <Badge variant="secondary" className="text-[10px] px-1 h-5 font-normal">{formatStatus(child.status)}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>

                    {/* 3. Status Distribution */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <PieChart className="h-4 w-4" /> Status Distribution
                            </span>
                        </div>

                        <div className="flex h-3 w-full rounded-full overflow-hidden">
                            {/* Simple visualization of status chunks */}
                            {Object.entries(statusCounts).map(([status, count], i) => {
                                let color = "bg-gray-400";
                                if (["DONE", "CLOSED", "RESOLVED"].includes(status)) color = "bg-green-500";
                                if (["IN_PROGRESS", "IN_Review"].includes(status)) color = "bg-blue-500";
                                if (["TODO", "BACKLOG"].includes(status)) color = "bg-slate-300";

                                const pct = (count / allRelatedIssues.length) * 100;
                                return (
                                    <div key={status} className={`${color}`} style={{ width: `${pct}%` }} title={`${status}: ${count}`} />
                                );
                            })}
                        </div>
                        <div className="flex gap-4 text-xs">
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <div key={status} className="flex items-center gap-1">
                                    <div className={cn("w-2 h-2 rounded-full", ["DONE", "CLOSED", "RESOLVED"].includes(status) ? "bg-green-500" : ["IN_PROGRESS"].includes(status) ? "bg-blue-500" : "bg-slate-300")} />
                                    <span className="text-muted-foreground">{formatStatus(status)}:</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <Dialog open={isIssueDetailOpen} onOpenChange={(o) => !o && closeIssueDetail()}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] w-full sm:max-w-[95vw] md:max-w-5xl h-[95vh] md:h-[90vh] p-0 flex flex-col gap-0 bg-background overflow-hidden outline-none"
            >
                <DialogTitle className="sr-only">Issue {issue.key}</DialogTitle>
                {showProgressModal && <ProgressModal />}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {parentIssue && (
                                <>
                                    <button
                                        onClick={() => openIssueDetail(parentIssue.id)}
                                        className="hover:text-foreground hover:underline transition-colors font-medium flex items-center gap-1"
                                    >
                                        <span className={cn("w-3 h-3 rounded flex items-center justify-center scale-75", getIssueTypeColor(parentIssue.type))}>
                                            {getIssueTypeIcon(parentIssue.type)}
                                        </span>
                                        {parentIssue.key}
                                    </button>
                                    <span className="text-muted-foreground/40">/</span>
                                </>
                            )}
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center", getIssueTypeColor(issue.type))}>
                                {getIssueTypeIcon(issue.type)}
                            </div>
                            <span>{issue.key}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0", issue.starred ? "text-yellow-500" : "text-muted-foreground")}
                            onClick={handleStarToggle}
                        >
                            <Star className={cn("h-4 w-4", issue.starred && "fill-yellow-500")} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground"
                            onClick={() => {
                                const url = typeof window !== 'undefined' ? window.location.href : '';
                                navigator.clipboard.writeText(url);
                                toast.success("Copied to clipboard");
                            }}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.print()}>Print</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowProgressModal(true)}>
                                    <BarChart2 className="mr-2 h-4 w-4" />
                                    View Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground ml-2" onClick={closeIssueDetail}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Content Scroll Area */}
                <ScrollArea className="flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] min-h-full sm:min-h-[500px]">

                        {/* LEFT COLUMN (Main) */}
                        <div className="p-8 md:pr-12 space-y-8">
                            <div>
                                <input
                                    className="flex h-10 w-full rounded-md border border-transparent bg-transparent px-0 py-2 text-2xl font-semibold shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/30 -ml-2 p-2 mb-4"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    placeholder="Issue Summary"
                                />

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-foreground">Description</h3>
                                    <Textarea
                                        className="min-h-[150px] resize-none border-transparent hover:border-input focus:border-input bg-transparent hover:bg-muted/30"
                                        placeholder="Add a description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onBlur={handleDescriptionSave}
                                    />
                                    <p className="text-xs text-muted-foreground">Markdown supported</p>
                                </div>
                            </div>



                            {/* Child Issues Section */}
                            {(issue.type === "EPIC" || issue.type === "STORY") && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-foreground">Child Issues</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                            onClick={() => openCreateIssue({
                                                projectId: issue.projectId,
                                                parentId: issue.id,
                                                type: issue.type === "EPIC" ? "STORY" : "TASK"
                                            })}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                                            Add {issue.type === "EPIC" ? "Story" : "Task"}
                                        </Button>
                                    </div>
                                    <div className="space-y-1">

                                        {projectIssues
                                            .filter((i) => i.parentId === issue.id)
                                            .map((child) => (
                                                <div
                                                    key={child.id}
                                                    onClick={() => openIssueDetail(child.id)}
                                                    title={`${child.key}: ${child.summary} (${formatStatus(child.status)}) - Click to view`}
                                                    className="
        group flex items-center justify-between gap-2
        p-1.5 rounded-sm cursor-pointer
        border border-transparent
        transition-all
        hover:bg-accent hover:text-accent-foreground
      "
                                                >
                                                    {/* LEFT: Issue type + summary */}
                                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                        <div
                                                            className={cn(
                                                                "w-4 h-4 rounded-sm flex items-center justify-center shrink-0 opacity-80",
                                                                getIssueTypeColor(child.type)
                                                            )}
                                                        >
                                                            {getIssueTypeIcon(child.type)}
                                                        </div>

                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <span className="text-xs text-muted-foreground font-mono shrink-0">
                                                                {child.key}
                                                            </span>
                                                            <span className="text-sm font-medium truncate leading-none opacity-90">
                                                                {child.summary}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* RIGHT: Metadata + Action */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* Show Story Points only if present */}
                                                        {child.storyPoints && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] px-1 h-5 font-mono text-muted-foreground bg-muted/50 group-hover:bg-background/50"
                                                            >
                                                                {child.storyPoints} pt
                                                            </Badge>
                                                        )}

                                                        {/* Status: Icon or Tiny Text? Text is clearer. */}
                                                        <span className={cn(
                                                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/30 text-muted-foreground group-hover:bg-background/50 transition-colors uppercase tracking-wider"
                                                        )}>
                                                            {child.status}
                                                        </span>

                                                        {/* Navigation Icon (Visible on Hover) */}
                                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                                    </div>
                                                </div>
                                            ))}

                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <div className="flex items-center gap-6 border-b mb-6">
                                    <div
                                        onClick={() => setActiveTab("comments")}
                                        className={cn(
                                            "py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-2",
                                            activeTab === "comments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Comments
                                    </div>
                                    <div
                                        onClick={() => setActiveTab("history")}
                                        className={cn(
                                            "py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-2",
                                            activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <History className="h-4 w-4" />
                                        History
                                    </div>
                                    <div
                                        onClick={() => setActiveTab("worklog")}
                                        className={cn(
                                            "py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-2",
                                            activeTab === "worklog" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Clock className="h-4 w-4" />
                                        Work Log
                                    </div>
                                </div>

                                {activeTab === "comments" && (
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <Avatar className="h-8 w-8 mt-1">
                                                <AvatarFallback>ME</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <Textarea
                                                    placeholder="Add a comment... (Press M to focus)"
                                                    className="min-h-[60px] resize-none"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground"></span>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={handleSaveComment}>Save</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setCommentText("")}>Cancel</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {sortedComments.map(comment => (
                                                <div key={comment.id} className="flex gap-4 group">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={comment.userAvatarUrl} />
                                                        <AvatarFallback>{getInitials(comment.userName || projectMembers.find(u => u.userId === comment.userId)?.displayName || "Unknown")}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold">{comment.userName || projectMembers.find(u => u.userId === comment.userId)?.displayName || "Unknown User"}</span>
                                                            <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {sortedComments.length === 0 && <p className="text-sm text-muted-foreground italic">No comments yet.</p>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "history" && (
                                    <div className="space-y-6">
                                        {activity.map((item) => {
                                            if (item.type === "COMMENT") {
                                                const comment = item.data as CommentType;
                                                return (
                                                    <div key={item.id} className="flex gap-4 group">
                                                        <div className="mt-1">
                                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={item.userAvatarUrl} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(item.userName || "U")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold">{item.userName || "Unknown User"}</span>
                                                                <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}</span>
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground">Comment</Badge>
                                                            </div>
                                                            <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                );
                                            } else if (item.type === "WORKLOG") {
                                                const log = item.data as WorkLogType;
                                                return (
                                                    <div key={item.id} className="flex gap-4 group items-start">
                                                        <div className="mt-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={item.userAvatarUrl} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(item.userName || "U")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold">{item.userName}</span>
                                                                <span className="text-sm font-medium text-green-600">logged {log.timeSpentMinutes}m</span>
                                                                <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}</span>
                                                            </div>
                                                            {log.description && <p className="text-sm text-muted-foreground">{log.description}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // HISTORY
                                                const h = item.data as IssueHistoryType;
                                                return (
                                                    <div key={item.id} className="flex gap-3 items-start text-sm">
                                                        <div className="mt-1 w-4">
                                                            {/* Placeholder alignment */}
                                                        </div>
                                                        <Avatar className="h-6 w-6 mt-1">
                                                            <AvatarImage src={item.userAvatarUrl} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(item.userName || "U")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <p>
                                                                <span className="font-semibold">{item.userName || "User"}</span>
                                                                <span className="text-muted-foreground"> changed </span>
                                                                <span className="font-medium">{h.field}</span>
                                                                <span className="text-muted-foreground"> from </span>
                                                                <span className="line-through opacity-70">{h.oldValue || "empty"}</span>
                                                                <span className="text-muted-foreground"> to </span>
                                                                <span className="font-medium">{h.newValue}</span>
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                        {activity.length === 0 && <p className="text-sm text-muted-foreground italic">No activity yet.</p>}
                                    </div>
                                )}

                                {activeTab === "worklog" && (
                                    <div className="space-y-6">
                                        <div className="border rounded-md p-4 bg-muted/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium">Log Work</h4>
                                                <div className="flex flex-col item-center">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        Total Logged: <span className="text-foreground">{formatMinutes(totalMinutes)}</span>
                                                    </span>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        Total Remaining: <span className="text-foreground">{formatMinutes(Math.max(0, (totalScopeStoryPoints * 480) - totalLoggedMinutes))}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <Input
                                                    placeholder="Time (minutes)"
                                                    type="number"
                                                    className="w-32"
                                                    value={workLogTime}
                                                    onChange={(e) => setWorkLogTime(e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Description (optional)"
                                                    className="flex-1"
                                                    value={workLogDesc}
                                                    onChange={(e) => setWorkLogDesc(e.target.value)}
                                                />
                                                <Button size="sm" onClick={handleSaveWorkLog}>Log</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {sortedWorkLogs.map(log => (
                                                <div key={log.id} className="flex gap-4 group items-center">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={log.userAvatarUrl} />
                                                        <AvatarFallback>{(log.userName || projectMembers.find(u => u.userId === log.userId)?.displayName || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold">{log.userName || projectMembers.find(u => u.userId === log.userId)?.displayName}</span>
                                                            <span className="text-sm font-medium text-green-600">logged {log.timeSpentMinutes}m</span>
                                                            <span className="text-xs text-muted-foreground">on {format(new Date(log.startedAt), "MMM d, yyyy")}</span>
                                                        </div>
                                                        {log.description && <p className="text-sm text-muted-foreground">{log.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                            {sortedWorkLogs.length === 0 && <p className="text-sm text-muted-foreground italic">No work logged yet.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Sidebar) */}
                        <div className="p-6 md:p-8 space-y-8 bg-background md:border-l border-border">

                            {/* Status Section */}
                            <div className="space-y-4">
                                <Select value={issue.status} onValueChange={(v) => handleStatusChange(v as IssueStatus)}>
                                    <SelectTrigger className={cn(
                                        "w-full font-semibold border-none shadow-none px-3 py-6 h-auto text-base ring-offset-0 focus:ring-0",
                                        issue.status === "DONE" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                            issue.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                                                issue.status === "IN_TESTING" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                                                    "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )}>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[10px] uppercase tracking-wider opacity-70">Status</span>
                                            <div className="flex items-center gap-2">
                                                <SelectValue>
                                                    {formatStatus(issue.status)}
                                                </SelectValue>
                                            </div>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => (
                                            <SelectItem key={s} value={s} className="font-medium">{formatStatus(s)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Details Group */}
                            <div className="border rounded-lg p-4 space-y-6">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Details</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                        <div className="flex flex-col">
                                            <label className="text-sm text-muted-foreground">Assignee</label>
                                            {currentUser && issue.assignee?.id !== currentUser.id && (
                                                <span
                                                    className="text-[10px] text-primary cursor-pointer hover:underline"
                                                    onClick={(e) => { e.stopPropagation(); handleAssigneeChange(currentUser.id); }}
                                                >
                                                    Assign to me
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 group cursor-pointer hover:bg-muted/50 p-1.5 -ml-1.5 rounded-md transition-colors">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={issue.assignee?.avatarUrl} />
                                                <AvatarFallback className="text-[10px]">{getInitials(projectMembers.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee?.name)}</AvatarFallback>
                                            </Avatar>
                                            <Select value={issue.assignee?.id || "unassigned"} onValueChange={handleAssigneeChange}>
                                                <SelectTrigger className="h-6 border-0 p-0 shadow-none bg-transparent focus:ring-0 text-sm hover:text-primary">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {projectMembers.map(u => <SelectItem key={u.userId} value={u.userId}>{u.displayName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                        <label className="text-sm text-muted-foreground">Priority</label>
                                        <Select value={issue.priority} onValueChange={(v) => handlePriorityChange(v as IssuePriority)}>
                                            <SelectTrigger className="h-6 border-0 p-0 shadow-none bg-transparent focus:ring-0 text-sm hover:text-primary w-auto flex justify-start">
                                                <div className="flex items-center gap-2">
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Story Points Field */}
                                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                        <label className="text-sm text-muted-foreground">Story Points</label>
                                        <Input
                                            className="h-7 w-20 px-2 py-1"
                                            type="number"
                                            value={storyPoints}
                                            onChange={(e) => setStoryPoints(e.target.value)}
                                            onBlur={handleStoryPointsSave}
                                        />
                                    </div>

                                    {(availableParents.length > 0 || issue.parentId) && (
                                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                            <label className="text-sm text-muted-foreground">Parent</label>
                                            <Select value={issue.parentId || "none"} onValueChange={handleParentChange}>
                                                <SelectTrigger
                                                    className="h-6 w-full border-0 p-0 shadow-none bg-transparent focus:ring-0 text-sm hover:text-primary justify-start overflow-hidden"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <SelectValue placeholder="None" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {availableParents.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("w-3 h-3 rounded flex items-center justify-center scale-75", getIssueTypeColor(p.type))}>
                                                                    {getIssueTypeIcon(p.type)}
                                                                </span>
                                                                <span className="truncate max-w-[200px]">{p.key} - {p.summary}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                        <label className="text-sm text-muted-foreground">Sprint</label>
                                        <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                            {issue.sprintId ? "Current Sprint" : "Backlog"}
                                        </span>
                                    </div>
                                </div>
                            </div>



                            {/* Automation / Dates */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Dates</span>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="grid gap-1">
                                        <span className="text-muted-foreground text-xs">Start Date</span>
                                        <DatePicker
                                            date={issue.startDate ? new Date(issue.startDate) : undefined}
                                            setDate={(date) => updateIssue({ issueId: issue.id, data: { startDate: date?.toISOString() } }).then(() => toast.success("Start date updated"))}
                                            placeholder="Set start date"
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <span className="text-muted-foreground text-xs">Due Date</span>
                                        <DatePicker
                                            date={issue.dueDate ? new Date(issue.dueDate) : undefined}
                                            setDate={(date) => updateIssue({ issueId: issue.id, data: { dueDate: date?.toISOString() } }).then(() => toast.success("Due date updated"))}
                                            placeholder="Set due date"
                                        />
                                    </div>
                                    <div className="flex justify-between py-1 border-t pt-2 mt-2">
                                        <span className="text-xs text-muted-foreground">Created</span>
                                        <span className="text-xs">{issue.createdAt ? format(new Date(issue.createdAt), "MMM d, yyyy") : "-"}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-xs text-muted-foreground">Updated</span>
                                        <span className="text-xs">{issue.updatedAt ? format(new Date(issue.updatedAt), "MMM d, yyyy") : "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog >
    );




}

