"use client";

import { useState } from "react";
import { useIssues, useUpdateIssue } from "@/features/issues/hooks/use-issues";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, ArrowUpDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";
import { Issue } from "@/features/issues/types";
import { useModalStore } from "@/store/use-modal-store";
import { useProjectMembers } from "../hooks/useProjects";

interface ProjectCalendarViewProps {
    projectId: string;
}

export function ProjectCalendarView({ projectId }: ProjectCalendarViewProps) {
    const { data: issues = [], isLoading } = useIssues(projectId);
    const { data: projectMembers } = useProjectMembers(projectId);
    const { openCreateIssue, openIssueDetail } = useModalStore();
    const { mutate: updateIssue } = useUpdateIssue();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sortBy, setSortBy] = useState<"priority" | "status" | "title" | "none">("none");

    const PRIORITY_ORDER: Record<string, number> = {
        "BLOCKER": 0, "CRITICAL": 1, "URGENT": 2, "HIGH": 3, "MEDIUM": 4, "LOW": 5, "LOWEST": 6
    };

    const STATUS_ORDER: Record<string, number> = {
        "BACKLOG": 0, "TODO": 1, "IN_PROGRESS": 2, "IN_REVIEW": 3, "IN_TESTING": 4, "DONE": 5, "RESOLVED": 6, "CLOSED": 7
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const issueId = active.id;
        const newDateIso = over.id;

        const issue = issues.find(i => i.id === issueId);
        if (!issue || !newDateIso) return;

        if (issue.dueDate !== newDateIso) {
            updateIssue({
                issueId,
                data: { dueDate: newDateIso }
            });
        }
    };


    // Filter project issues with due dates

    const projectIssues = issues.filter(
        (issue) => issue.dueDate
    );

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);

    const calendarIndicies = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    const getIssuesForDay = (day: Date) => {
        const daysIssues = projectIssues.filter((issue) =>
            issue.dueDate && isSameDay(new Date(issue.dueDate), day)
        );

        if (sortBy === "none") return daysIssues;

        return [...daysIssues].sort((a, b) => {
            if (sortBy === "priority") {
                const pA = PRIORITY_ORDER[a.priority] ?? 99;
                const pB = PRIORITY_ORDER[b.priority] ?? 99;
                return pA - pB;
            }
            if (sortBy === "status") {
                const sA = STATUS_ORDER[a.status] ?? 99;
                const sB = STATUS_ORDER[b.status] ?? 99;
                return sA - sB;
            }
            if (sortBy === "title") {
                return a.summary.localeCompare(b.summary);
            }
            return 0;
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "BUG": return "bg-red-500 hover:bg-red-600";
            case "STORY": return "bg-green-500 hover:bg-green-600";
            case "EPIC": return "bg-purple-500 hover:bg-purple-600";
            case "TASK": return "bg-blue-500 hover:bg-blue-600";
            default: return "bg-slate-500 hover:bg-slate-600";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Highest": return "bg-red-500 hover:bg-red-600";
            case "High": return "bg-orange-500 hover:bg-orange-600";
            case "Medium": return "bg-yellow-500 hover:bg-yellow-600";
            case "Low": return "bg-blue-500 hover:bg-blue-600";
            case "Lowest": return "bg-slate-500 hover:bg-slate-600";
            default: return "bg-primary";
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Default</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center border rounded-md bg-muted/50">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={today} className="h-8 px-2 text-xs font-medium">
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid - Fix overflow with min-h-0 and ensure borders */}
            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] overflow-hidden min-h-0 border-l border-t">
                {/* Days of week header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r bg-muted/5">
                        {day}
                    </div>
                ))}

                {/* Days cells */}
                <div className="col-span-7 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                    {calendarIndicies.map((day, dayIdx) => {
                        const dayIssues = getIssuesForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => openCreateIssue({ dueDate: day.toISOString(), projectId })}
                                className={cn(
                                    "min-h-[120px] p-2 border-b border-r transition-colors flex flex-col gap-1 cursor-pointer group relative",
                                    !isCurrentMonth
                                        ? "bg-muted/30 text-muted-foreground/50 hover:bg-muted/40"
                                        : "bg-background hover:bg-muted/10",
                                    isToday && "bg-blue-50/50 dark:bg-blue-900/20 shadow-inner ring-1 ring-inset ring-blue-500/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span
                                        className={cn(
                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                            isToday ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                    {/* Add Button - Visible on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center hover:bg-primary hover:text-primary-foreground border-dashed border-primary/40">
                                            <Plus className="h-3 w-3" />
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] no-scrollbar" onClick={e => e.stopPropagation()}>
                                    {dayIssues.map((issue) => (
                                        <HoverCard key={issue.id}>
                                            <HoverCardTrigger asChild>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openIssueDetail(issue.id);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded cursor-pointer truncate text-white font-medium shadow-sm transition-opacity hover:opacity-80 active:scale-[0.98]",
                                                        getTypeColor(issue.type)
                                                    )}
                                                >
                                                    {issue.key} {issue.summary}
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80 p-0 overflow-hidden" align="start">
                                                <div className="flex flex-col">
                                                    <div className={cn("h-1 w-full", getPriorityColor(issue.priority))} />
                                                    <div className="p-3 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-sm font-semibold leading-none">{issue.summary}</h4>
                                                            <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white", getTypeColor(issue.type))}>
                                                                {issue.type}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                                            {issue.description || "No description provided."}
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-5 w-5 cursor-help" title={issue.assignee?.displayName || issue.assignee?.name}>
                                                                    <AvatarFallback className="text-[9px]">{getInitials(projectMembers?.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee?.name)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs text-muted-foreground">{projectMembers?.find(m => m.userId === issue.assignee?.id)?.displayName || issue.assignee?.name || "Unassigned"}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px] h-5">{issue.status}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
    );
}
