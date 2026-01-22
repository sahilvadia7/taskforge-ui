"use client";

import { IssueStatus } from "@/features/issues/types";
import { useIssues } from "@/features/issues/hooks/use-issues";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, Label } from "recharts";
import { Activity, CheckCircle2, Clock, Users, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatStatus } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


import { ChevronRight, ChevronDown, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProjectSummaryViewProps {
    projectId: string;
}

export function ProjectSummaryView({ projectId }: ProjectSummaryViewProps) {
    const { data: issues = [], isLoading } = useIssues(projectId);
    const [selectedEpicId, setSelectedEpicId] = useState<string>("all");

    const COLORS = [
        'var(--color-chart-1)',
        'var(--color-chart-2)',
        'var(--color-chart-3)',
        'var(--color-chart-4)',
        'var(--color-chart-5)'
    ];

    // --- Derived State (Hooks first!) ---

    // 1. Children Map (Used by many things)
    // Memoizing to keep dependencies stable for subsequent useMemos
    const childrenMap = useMemo(() => {
        return issues.filter(i => i.type !== 'EPIC').reduce((acc, issue) => {
            if (issue.parentId) {
                if (!acc[issue.parentId]) acc[issue.parentId] = [];
                acc[issue.parentId].push(issue);
            }
            return acc;
        }, {} as Record<string, typeof issues>);
    }, [issues]);

    // 2. Epics List
    const epics = useMemo(() => issues.filter(i => i.type === 'EPIC'), [issues]);

    // 3. Filtered Issues for Progress Chart (Recursive for Epics)
    const filteredProgressIssues = useMemo(() => {
        if (selectedEpicId === "all") {
            return issues.filter(i => i.type !== 'EPIC');
        }

        // Recursive helper to get all descendants
        const getDescendants = (parentId: string): typeof issues => {
            const children = childrenMap[parentId] || [];
            let descendants = [...children];
            children.forEach(child => {
                descendants = [...descendants, ...getDescendants(child.id)];
            });
            return descendants;
        };

        return getDescendants(selectedEpicId);
    }, [selectedEpicId, issues, childrenMap]);

    // 4. Trend Data for Area Chart
    const trendData = useMemo(() => {
        if (!filteredProgressIssues.length) return [];

        const events: { date: number; type: 'create' | 'complete' }[] = [];
        filteredProgressIssues.forEach(issue => {
            events.push({ date: new Date(issue.createdAt).setHours(0, 0, 0, 0), type: 'create' });
            if (['DONE', 'RESOLVED', 'CLOSED'].includes(issue.status)) {
                events.push({ date: new Date(issue.updatedAt).setHours(0, 0, 0, 0), type: 'complete' });
            }
        });

        if (events.length === 0) return [];

        events.sort((a, b) => a.date - b.date);
        const uniqueDates = Array.from(new Set(events.map(e => e.date))).sort((a, b) => a - b);

        const dataPoints: { date: string, Total: number, Completed: number }[] = [];
        let runningTotal = 0;
        let runningCompleted = 0;

        uniqueDates.forEach(dateMs => {
            const daysEvents = events.filter(e => e.date === dateMs);
            daysEvents.forEach(e => {
                if (e.type === 'create') runningTotal++;
                if (e.type === 'complete') runningCompleted++;
            });

            dataPoints.push({
                date: new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                Total: runningTotal,
                Completed: runningCompleted
            });
        });

        return dataPoints;
    }, [filteredProgressIssues]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-3 h-[300px] rounded-xl" />
                    <Skeleton className="col-span-4 h-[300px] rounded-xl" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                    <Skeleton className="col-span-3 h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }



    // Status Counts Data
    const statusCounts = issues.reduce((acc, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Recent Activity Data
    const recentActivity = [...issues]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    // Types of Work Data
    const typeCounts = issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const typeChartData = Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
    }));

    // Team Workload Data
    const workloadCounts = issues.reduce((acc, issue) => {
        const assigneeName = issue.assignee?.name || 'Unassigned';
        acc[assigneeName] = (acc[assigneeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const workloadData = Object.entries(workloadCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 assignees

    // Epic Progress Data (Derived from stable logic above)
    const epicProgressData = epics.map(epic => {
        const children = childrenMap[epic.id] || [];
        const total = children.length;
        const completed = children.filter(c => ['DONE', 'RESOLVED', 'CLOSED'].includes(c.status)).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...epic, progress, total, completed };
    }).sort((a, b) => b.progress - a.progress);


    const totalFiltered = filteredProgressIssues.length;
    const completedFiltered = filteredProgressIssues.filter(i => ['DONE', 'RESOLVED', 'CLOSED'].includes(i.status)).length;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {label}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href={`/projects/${projectId}/board`} className="block">
                    <Card className="rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{issues.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all statuses
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {Object.entries(statusCounts).map(([status, count]) => {
                    const formattedStatus = formatStatus(status);
                    let icon = <CheckCircle2 className="h-4 w-4 text-gray-500" />;
                    let borderColor = "hover:border-gray-500/50";

                    if (status === "DONE" || status === "RESOLVED" || status === "CLOSED") {
                        icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                        borderColor = "hover:border-green-500/50";
                    } else if (status === "IN_PROGRESS" || status === "IN_REVIEW") {
                        icon = <Clock className="h-4 w-4 text-blue-500" />;
                        borderColor = "hover:border-blue-500/50";
                    } else if (status === "TODO" || status === "BACKLOG") {
                        icon = <Activity className="h-4 w-4 text-orange-500" />;
                        borderColor = "hover:border-orange-500/50";
                    }

                    return (
                        <Link key={status} href={`/projects/${projectId}/board`} className="block">
                            <Card className={`rounded-xl shadow-sm hover:shadow-md transition-all ${borderColor} cursor-pointer h-full`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{formattedStatus}</CardTitle>
                                    {icon}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight">{count}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Issues in {formattedStatus}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* New Progress Chart Section */}
            <Card className="rounded-xl shadow-sm border-border/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Project Burnup
                        </CardTitle>
                        <CardDescription>
                            Comparing Total Scope vs Completed Work over time
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Filter by Epic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Issues</SelectItem>
                                {epics.map(epic => (
                                    <SelectItem key={epic.id} value={epic.id}>
                                        {epic.summary}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                {label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                        {payload.map((item: any) => (
                                                            <div key={item.name} className="flex flex-col">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground flex items-center gap-1">
                                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                                    {item.name}
                                                                </span>
                                                                <span className="font-bold text-lg">
                                                                    {item.value}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{
                                        stroke: "var(--border)",
                                        strokeWidth: 2,
                                        strokeDasharray: "4 4"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Total"
                                    stroke="var(--color-primary)"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Completed"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Summary Metrics */}
                    <div className="flex justify-center gap-8 mt-4 text-sm border-t pt-4">
                        <div className="flex flex-col items-center">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Scope</span>
                            <span className="font-bold text-2xl">{totalFiltered}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Completed</span>
                            <span className="font-bold text-2xl text-green-600">{completedFiltered}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Rate</span>
                            <span className="font-bold text-2xl">{totalFiltered > 0 ? Math.round((completedFiltered / totalFiltered) * 100) : 0}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Existing Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Types of Work */}
                <Card className="col-span-3 rounded-xl shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle>Types of Work</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-0">
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                {payload[0].name}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-foreground">
                                                            {payload[0].value}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Pie
                                        data={typeChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        strokeWidth={5}
                                        stroke="var(--color-card)"
                                    >
                                        {typeChartData.map((entry, index) => {
                                            // Map specific types to specific chart colors matching the Issue Filter icons
                                            // Task: Blue, Bug: Red, Story: Green, Epic: Purple
                                            const typeColorMap: Record<string, string> = {
                                                'STORY': '#16a34a', // green-600
                                                'TASK': '#2563eb',  // blue-600
                                                'BUG': '#dc2626',   // red-600
                                                'EPIC': '#9333ea',  // purple-600
                                            };
                                            // Fallback to cycle if unknown
                                            return <Cell key={`cell-${index}`} fill={typeColorMap[entry.name] || COLORS[index % COLORS.length]} />;
                                        })}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    const { cx, cy } = viewBox;
                                                    return (
                                                        <text
                                                            x={cx}
                                                            y={cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={cx}
                                                                y={cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {issues.length}
                                                            </tspan>
                                                            <tspan
                                                                x={cx}
                                                                y={(cy || 0) + 24}
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                Issues
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Workload */}
                <Card className="col-span-4 rounded-xl shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle>Team Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                                    <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Epic Progress */}
                <Card className="col-span-4 rounded-xl shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle>Epic Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0">
                            <Accordion type="multiple" className="w-full">
                                {epicProgressData.map(epic => {
                                    const children = childrenMap[epic.id] || [];

                                    return (
                                        <AccordionItem key={epic.id} value={epic.id} className="border-b px-6 py-2">
                                            <AccordionTrigger className="hover:no-underline py-3">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3 overflow-hidden pr-4">
                                                        <Activity className="h-4 w-4 text-purple-600 shrink-0" />
                                                        <span className="font-semibold text-sm text-foreground truncate">{epic.summary}</span>
                                                        <span className="text-xs text-muted-foreground hidden sm:inline-block">({epic.key})</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <div className="flex flex-col w-[100px] gap-1.5 items-end">
                                                            <span className="text-xs text-muted-foreground font-medium">{epic.progress}%</span>
                                                            <Progress value={epic.progress} className="h-1.5 w-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <div className="space-y-1">
                                                    {children.length > 0 ? (
                                                        children.map((child: any) => (
                                                            <NestedIssueItem
                                                                key={child.id}
                                                                issue={child}
                                                                childrenMap={childrenMap}
                                                                projectId={projectId}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground italic pl-9 py-2">No child issues linked.</div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                            {epicProgressData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">No Epics found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 rounded-xl shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((issue) => (
                                <Link key={issue.id} href={`/projects/${projectId}/board`} className="block group">
                                    <div className="flex items-start group-hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2">
                                        <div className="relative mt-1">
                                            <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-border/20 z-10 relative">
                                                <AvatarImage src={issue.assignee?.avatarUrl} alt="Avatar" />
                                                <AvatarFallback className="text-xs bg-muted">{issue.assignee ? getInitials(issue.assignee.displayName || issue.assignee.name) : "?"}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="ml-4 space-y-1 overflow-hidden">
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors truncate">
                                                {issue.summary}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                <span className="font-semibold text-foreground/80">{issue.assignee?.name || "Unassigned"}</span> updated <span className="font-mono text-[10px] bg-muted px-1 rounded">{issue.key}</span>
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-full whitespace-nowrap">
                                            {new Date(issue.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function NestedIssueItem({ issue, childrenMap, projectId }: { issue: any, childrenMap: any, projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const children = childrenMap[issue.id] || [];
    const hasChildren = children.length > 0;

    const assigneeName = issue.assignee?.displayName || issue.assignee?.name || "Unassigned";
    const assigneeInitials = getInitials(assigneeName);

    // Status Colors
    let statusColor = "text-gray-500";
    if (issue.status === "DONE" || issue.status === "RESOLVED") statusColor = "text-green-500";
    if (issue.status === "IN_PROGRESS") statusColor = "text-blue-500";

    return (
        <div className="w-full">
            <div className="flex items-center gap-1 group">
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
                    className="flex-1 flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors min-w-0"
                >
                    <div className="flex items-center justify-center w-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${issue.type === 'BUG' ? 'bg-red-500' : issue.type === 'STORY' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate text-foreground/90">{issue.summary}</span>
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">{issue.key}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {issue.assignee && (
                            <Avatar className="h-5 w-5 border-2 border-background">
                                <AvatarImage src={issue.assignee.avatarUrl} />
                                <AvatarFallback className="text-[9px]">{assigneeInitials}</AvatarFallback>
                            </Avatar>
                        )}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/50 ${statusColor}`}>
                            {formatStatus(issue.status)}
                        </span>
                    </div>
                </Link>
            </div>

            {hasChildren && isOpen && (
                <div className="pl-6 border-l ml-2.5 mt-1 space-y-1">
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
