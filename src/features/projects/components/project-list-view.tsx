"use client";

import { useState, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Issue } from "@/features/issues/types";
import { useIssues, useMyIssues, useAllIssues } from "@/features/issues/hooks/use-issues";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    CheckSquare,
    Bookmark,
    Bug,
    ChevronsUp,
    ChevronUp,
    ChevronsDown,
    ChevronDown,
    Ban,
    Equal,
    MessageSquare,
    Calendar,
    Plus,
    LayoutList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useModalStore } from "@/store/use-modal-store";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, getInitials } from "@/lib/utils";
import { useProjectMembers } from "../hooks/useProjects";
interface ProjectListViewProps {
    projectId?: string; // Make optional
    mode?: "PROJECT" | "MY" | "ALL";
}

export function ProjectListView({ projectId, mode = "PROJECT" }: ProjectListViewProps) {
    // Conditional hooks are tricky. We can use a custom hook wrapper or just call both and use one.
    // Since useQuery respects 'enabled', we can toggle them.

    // Project Issues
    const { data: projectIssues, isLoading: projectLoading } = useIssues(projectId || "");

    // My Issues
    const { data: myIssues, isLoading: myLoading } = useMyIssues();

    // All Tenant Issues
    const { data: allIssues, isLoading: allLoading } = useAllIssues();

    let issues: Issue[] = [];
    let isLoading = false;

    if (mode === "MY") {
        issues = myIssues || [];
        isLoading = myLoading;
    } else if (mode === "ALL") {
        issues = allIssues || [];
        isLoading = allLoading;
    } else {
        issues = projectIssues || [];
        isLoading = projectLoading;
    }

    // Members only relevant for PROJECT mode
    const { data: members } = useProjectMembers(projectId || "");
    const [sorting, setSorting] = useState<SortingState>([]);
    const { openIssueDetail } = useModalStore();

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string | "ALL">("ALL");

    // Filtered Issues
    const filteredIssues = useMemo(() => {
        return issues.filter(issue => {
            const matchesSearch = issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.key.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAssignee = assigneeFilter === "ALL" || issue.assignee?.id === assigneeFilter;
            return matchesSearch && matchesAssignee;
        });
    }, [issues, searchQuery, assigneeFilter]);

    const columns: ColumnDef<Issue>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = (row.getValue("type") as string || "").toUpperCase();
                if (type === "BUG") return <Bug className="h-4 w-4 text-red-500" />;
                if (type === "STORY") return <Bookmark className="h-4 w-4 text-green-500" />;
                if (type === "EPIC") return <LayoutList className="h-4 w-4 text-purple-500" />;
                // Default to Task
                return <CheckSquare className="h-4 w-4 text-blue-500" />;
            },
            size: 60,
        },
        {
            accessorKey: "summary",
            header: "Summary",
            cell: ({ row }) => (
                <div className="font-medium text-sm text-foreground">
                    {row.getValue("summary")}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let colorClass = "bg-slate-200 text-slate-700 hover:bg-slate-300"; // Default (TO DO)
                if (status === "DONE") colorClass = "bg-green-100 text-green-700 hover:bg-green-200";
                if (status === "IN PROGRESS") colorClass = "bg-blue-100 text-blue-700 hover:bg-blue-200";
                if (status === "TESTING") colorClass = "bg-amber-100 text-amber-700 hover:bg-amber-200";

                return (
                    <Badge variant="secondary" className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "dueDate",
            header: "Due date",
            cell: ({ row }) => {
                const date = row.original.dueDate;
                if (!date) return <div className="h-full w-full" />;
                return (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        {date ? format(new Date(date), "MMM d, yyyy") : ""}
                    </div>
                );
            },
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = (row.getValue("priority") as string || "").toUpperCase();

                let icon = <Equal className="h-4 w-4 text-muted-foreground" />;
                let colorClass = "text-muted-foreground";

                switch (priority) {
                    case "BLOCKER":
                        icon = <Ban className="h-4 w-4 text-red-600" />;
                        colorClass = "text-red-600 font-medium";
                        break;
                    case "CRITICAL":
                        icon = <ChevronsUp className="h-4 w-4 text-red-500" />;
                        colorClass = "text-red-600 font-medium";
                        break;
                    case "URGENT":
                        icon = <ChevronsUp className="h-4 w-4 text-orange-600" />;
                        colorClass = "text-orange-700 font-medium";
                        break;
                    case "HIGH":
                    case "HIGHEST":
                        icon = <ChevronUp className="h-4 w-4 text-orange-500" />;
                        colorClass = "text-orange-600 font-medium";
                        break;
                    case "MEDIUM":
                        icon = <Equal className="h-4 w-4 text-yellow-500" />;
                        colorClass = "text-yellow-600 font-medium";
                        break;
                    case "LOW":
                        icon = <ChevronDown className="h-4 w-4 text-blue-500" />;
                        colorClass = "text-blue-600 font-medium";
                        break;
                    case "LOWEST":
                        icon = <ChevronsDown className="h-4 w-4 text-slate-400" />;
                        colorClass = "text-slate-500 font-medium";
                        break;
                }

                return (
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className={`text-sm capitalize ${colorClass}`}>{priority.toLowerCase()}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "storyPoints",
            header: "Pts",
            cell: ({ row }) => {
                const points = row.original.storyPoints;
                if (points === undefined || points === null) return <span className="text-muted-foreground">-</span>;
                return (
                    <Badge variant="outline" className="text-xs font-mono">
                        {points}
                    </Badge>
                );
            },
            size: 50,
        },
        {
            accessorKey: "assignee",
            header: "Assignee",
            cell: ({ row }) => {
                const assignee = row.original.assignee;
                return (
                    <div className="flex items-center gap-2">
                        {assignee ? (
                            <>
                                <Avatar className="h-6 w-6 cursor-help" title={members?.find(m => m.userId === assignee.id)?.displayName || assignee.name}>
                                    <AvatarImage src={assignee.avatarUrl} />
                                    <AvatarFallback className="text-[10px]">{getInitials(members?.find(m => m.userId === assignee.id)?.displayName || assignee.name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-foreground">{assignee.name}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "comments",
            header: "Comments",
            cell: () => (
                <div className="flex items-center text-muted-foreground hover:bg-muted/50 rounded p-1 cursor-text w-max">
                    <MessageSquare className="mr-2 h-3.5 w-3.5" />
                    <span className="text-xs">Add comment</span>
                </div>
            )
        },
        {
            id: "actions",
            header: "",
            cell: () => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Plus className="h-4 w-4" />
                </Button>
            )
        }
    ];

    const table = useReactTable({
        data: filteredIssues,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
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

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => openIssueDetail(row.original.id)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </div>
        </div>
    );
}
