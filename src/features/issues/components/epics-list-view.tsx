"use client";

import { useIssues } from "@/features/issues/hooks/use-issues";
import { Issue, IssueStatus, IssueType } from "@/features/issues/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatStatus } from "@/lib/utils";
import { CheckCircle2, Clock, Activity, AlertCircle, Bookmark, FileText, Bug, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useModalStore } from "@/store/use-modal-store";
import { useProjectMembers } from "@/features/projects/hooks/useProjects";
import { IssueFilterBar } from "./issue-filter-bar";
import { useState } from "react";

interface EpicsListViewProps {
    projectId: string;
}

export function EpicsListView({ projectId }: EpicsListViewProps) {
    const { data: issues = [], isLoading } = useIssues(projectId);
    const { data: projectMembers = [] } = useProjectMembers(projectId);
    const { openCreateIssue, openIssueDetail } = useModalStore();

    const [selectedTypes, setSelectedTypes] = useState<IssueType[]>([]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    const epics = issues.filter((issue) => issue.type === "EPIC");
    const otherIssues = issues.filter((issue) => issue.type !== "EPIC");

    const childrenMap = otherIssues.reduce((acc, issue) => {
        if (issue.parentId) {
            if (!acc[issue.parentId]) {
                acc[issue.parentId] = [];
            }
            acc[issue.parentId].push(issue);
        }
        return acc;
    }, {} as Record<string, Issue[]>);

    const getEpicProgress = (epicId: string) => {
        const children = childrenMap[epicId] || [];
        if (children.length === 0) return 0;

        const completed = children.filter(
            (c) => c.status === "DONE" || c.status === "RESOLVED" || c.status === "CLOSED"
        ).length;
        return Math.round((completed / children.length) * 100);
    };

    const getTypeIcon = (type: IssueType) => {
        switch (type) {
            case "EPIC":
                return <Activity className="h-4 w-4 text-purple-500" />;
            case "STORY":
                return <Bookmark className="h-4 w-4 text-green-600" />;
            case "BUG":
                return <Bug className="h-4 w-4 text-red-500" />;
            case "TASK":
                return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            case "SUB_TASK":
                return <FileText className="h-4 w-4 text-gray-500" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getAssigneeDetails = (assigneeId?: string, fallbackName?: string, fallbackAvatar?: string) => {
        if (!assigneeId) return null;
        const member = projectMembers.find(m => m.userId === assigneeId);
        return {
            name: member?.displayName || fallbackName || "Unassigned",
            avatarUrl: member?.user?.avatarUrl || member?.avatarUrl || fallbackAvatar,
            initials: getInitials(member?.displayName || fallbackName || "?")
        };
    };

    if (epics.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No epics found. Create an epic to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <IssueFilterBar selectedTypes={selectedTypes} onTypeChange={setSelectedTypes} />
            </div>

            <Accordion type="multiple" className="w-full space-y-4">
                {epics.map((epic) => {
                    const progress = getEpicProgress(epic.id);
                    const allChildren = childrenMap[epic.id] || [];
                    const children = selectedTypes.length > 0
                        ? allChildren.filter(c => selectedTypes.includes(c.type))
                        : allChildren;

                    return (
                        <AccordionItem key={epic.id} value={epic.id} className="border rounded-lg bg-card px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-4 w-full pr-4">
                                    <div
                                        className="flex items-center gap-2 min-w-[200px] cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openIssueDetail(epic.id);
                                        }}
                                    >
                                        {getTypeIcon(epic.type)}
                                        <span className="font-semibold text-sm text-muted-foreground hover:underline">{epic.key}</span>
                                        <span className="font-medium truncate hover:underline text-left">{epic.summary}</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-4 ml-auto justify-end">
                                        <div className="flex flex-col w-[150px] gap-1">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {formatStatus(epic.status)}
                                        </Badge>
                                        <div className="flex items-center -space-x-2">
                                            {children.slice(0, 3).map((child) => {
                                                const assignee = getAssigneeDetails(child.assignee?.id, child.assignee?.name, child.assignee?.avatarUrl);
                                                return assignee && (
                                                    <Avatar key={child.id} className="h-6 w-6 border-2 border-background" title={assignee.name}>
                                                        <AvatarImage src={assignee.avatarUrl} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {assignee.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                );
                                            })}
                                            {children.filter(c => c.assignee).length > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                                                    +{children.filter(c => c.assignee).length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4">
                                <div className="pl-6 space-y-2">
                                    {children.length > 0 ? (
                                        children.map((child) => (
                                            <NestedIssueItem
                                                key={child.id}
                                                issue={child}
                                                childrenMap={childrenMap}
                                                projectId={projectId}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic py-2 pl-2">
                                            No child issues found {selectedTypes.length > 0 && "matching filter"}.
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-muted-foreground hover:text-foreground h-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openCreateIssue({ type: "STORY", parentId: epic.id, projectId });
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Story
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}

function NestedIssueItem({ issue, childrenMap, projectId }: { issue: Issue, childrenMap: Record<string, Issue[]>, projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const children = childrenMap[issue.id] || [];
    const hasChildren = children.length > 0;

    const assigneeName = issue.assignee?.displayName || issue.assignee?.name || "Unassigned";
    const assigneeInitials = getInitials(assigneeName);

    const getStatusIcon = (status: IssueStatus) => {
        if (status === "DONE" || status === "RESOLVED" || status === "CLOSED") {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        } else if (status === "IN_PROGRESS" || status === "IN_REVIEW") {
            return <Clock className="h-4 w-4 text-blue-500" />;
        } else if (status === "TODO" || status === "BACKLOG") {
            return <Activity className="h-4 w-4 text-orange-500" />;
        }
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const getTypeIcon = (type: IssueType) => {
        switch (type) {
            case "EPIC": return <Activity className="h-4 w-4 text-purple-500" />;
            case "STORY": return <Bookmark className="h-4 w-4 text-green-600" />;
            case "BUG": return <Bug className="h-4 w-4 text-red-500" />;
            case "TASK": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            case "SUB_TASK": return <FileText className="h-4 w-4 text-gray-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 group">
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                        className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    >
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                <Link
                    href={`/projects/${projectId}/board?issue=${issue.id}`}
                    className="flex-1 flex items-center gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                >
                    <div className="flex items-center gap-2 min-w-[120px]">
                        {getTypeIcon(issue.type)}
                        <span className="text-xs font-mono text-muted-foreground">{issue.key}</span>
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{issue.summary}</span>
                    <div className="flex items-center gap-4">
                        {issue.assignee && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={issue.assignee.avatarUrl} />
                                    <AvatarFallback className="text-[10px]">{assigneeInitials}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                    {assigneeName}
                                </span>
                            </div>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize flex items-center gap-1 min-w-[80px] justify-center">
                            {getStatusIcon(issue.status)}
                            {formatStatus(issue.status)}
                        </Badge>
                        <Badge variant={issue.priority === 'BLOCKER' || issue.priority === 'CRITICAL' ? 'destructive' : 'outline'} className="text-[10px] px-1 py-0 h-5">
                            {issue.priority}
                        </Badge>
                    </div>
                </Link>
            </div>

            {hasChildren && isOpen && (
                <div className="pl-6 border-l ml-3.5 mt-1 space-y-1">
                    {children.map((child: any) => (
                        <NestedIssueItem
                            key={child.id}
                            issue={child}
                            childrenMap={childrenMap}
                            projectId={projectId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
