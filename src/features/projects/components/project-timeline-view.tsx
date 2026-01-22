"use client";

import { useState, useMemo } from "react";
import { useIssues } from "@/features/issues/hooks/use-issues";
import { format, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Filter, LayoutList, Search, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectMembers } from "../hooks/useProjects";
import { useModalStore } from "@/store/use-modal-store";
import { getInitials } from "@/lib/utils";

interface ProjectTimelineViewProps {
    projectId: string;
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
    const { data: issues = [], isLoading } = useIssues(projectId);
    const { data: members } = useProjectMembers(projectId);
    const { openIssueDetail } = useModalStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string | "ALL">("ALL");

    // Filter for Epics only for the high-level roadmap
    const epics = useMemo(() => {
        return issues
            .filter(i => i.type === "EPIC" && i.startDate && i.dueDate)
            .filter(i => {
                const matchesSearch = i.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.key.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesAssignee = assigneeFilter === "ALL" || i.assignee?.id === assigneeFilter;
                return matchesSearch && matchesAssignee;
            })
            .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());
    }, [issues, searchQuery, assigneeFilter]);

    const timelineStart = currentDate;
    const timelineEnd = addMonths(currentDate, 12);
    const months = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });

    const handlePrevYear = () => setCurrentDate(d => addMonths(d, -12));
    const handleNextYear = () => setCurrentDate(d => addMonths(d, 12));

    // Helper to calculate bar position and width
    const getBarStyles = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let offsetDays = differenceInDays(start, timelineStart);
        if (offsetDays < 0) offsetDays = 0; // Clip start if before window

        let durationDays = differenceInDays(end, start);
        if (durationDays < 1) durationDays = 1; // Minimum width

        // Convert to percentage
        const left = (offsetDays / 365) * 100;
        const width = (durationDays / 365) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 mr-4">
                        <h2 className="text-lg font-semibold">Roadmap</h2>
                        <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">{epics.length} Epics</Badge>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search epics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9 w-[200px] lg:w-[300px]"
                            />
                        </div>
                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger className="h-9 w-[180px]">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="truncate">
                                        {assigneeFilter === "ALL" ? "All Assignees" : members?.find(m => m.userId === assigneeFilter)?.displayName || "Unknown User"}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Assignees</SelectItem>
                                {members?.map(member => (
                                    <SelectItem key={member.userId} value={member.userId}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5 cursor-help" title={member.displayName}>
                                                <AvatarFallback className="text-[10px]">{getInitials(member.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.displayName}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(searchQuery || assigneeFilter !== "ALL") && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => {
                                    setSearchQuery("");
                                    setAssigneeFilter("ALL");
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar (List of Epics) */}
                <div className="w-[280px] flex-shrink-0 border-r flex flex-col bg-muted/5">
                    <div className="h-10 border-b flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                        Epic Name
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {epics.map(epic => (
                            <div
                                key={epic.id}
                                className="h-12 flex items-center px-4 border-b hover:bg-muted/50 transition-colors cursor-pointer group"
                                onClick={() => openIssueDetail(epic.id)}
                            >
                                <LayoutList className="h-4 w-4 text-purple-600 mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium truncate flex-1">{epic.summary}</span>
                            </div>
                        ))}
                        {epics.length === 0 && (
                            <div className="p-4 text-sm text-muted-foreground text-center">No epics with dates found.</div>
                        )}
                    </div>
                </div>

                {/* Right Timeline Grid */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Calendar Header */}
                    <div className="h-10 border-b flex items-center bg-muted/20 absolute top-0 left-0 right-0 z-10 w-full">
                        <Button variant="ghost" size="icon" className="h-8 w-8 absolute left-0 z-20" onClick={handlePrevYear}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-1 w-full relative">
                            {months.map((month, i) => (
                                <div key={i} className="flex-1 border-r flex justify-center items-center text-xs font-medium text-muted-foreground min-w-[100px]">
                                    {format(month, "MMM yyyy")}
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 absolute right-0 z-20" onClick={handleNextYear}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Grid Body */}
                    <div className="flex-1 overflow-y-auto pt-10 relative">
                        {/* Vertical Grid Lines */}
                        <div className="absolute inset-0 top-10 flex pointer-events-none">
                            {months.map((_, i) => (
                                <div key={i} className="flex-1 border-r border-dashed opacity-50"></div>
                            ))}
                        </div>

                        {/* Bars */}
                        <div>
                            {epics.map((epic, index) => {
                                const itemStyles = getBarStyles(epic.startDate!, epic.dueDate!);
                                return (
                                    <div key={epic.id} className="h-12 border-b relative flex items-center hover:bg-muted/10 transition-colors">
                                        {/* The Bar */}
                                        <div
                                            className="absolute h-6 rounded-md bg-purple-500/90 hover:bg-purple-600 shadow-sm cursor-pointer transition-all hover:h-7 group z-10 mx-1 flex items-center px-2"
                                            style={itemStyles}
                                            onClick={() => openIssueDetail(epic.id)}
                                        >
                                            <span className="text-[10px] font-bold text-white truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 sticky left-2">
                                                {format(new Date(epic.startDate!), "MMM d")} - {format(new Date(epic.dueDate!), "MMM d")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
