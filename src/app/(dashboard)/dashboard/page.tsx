"use client";

import { useProjects } from "@/features/projects/hooks/useProjects";
import { useMyIssues, useRecentIssues, useStarredIssues } from "@/features/issues/hooks/use-issues";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
    CheckCircle2,
    Layout,
    Plus,
    Star,
    FileEdit,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    GitCommit,
    History as HistoryIcon,
    AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/use-modal-store";
import { useTenantStore } from "@/store/use-tenant-store";
import { toast } from "sonner";
import { PageSpinner } from "@/components/ui/spinner";

export default function DashboardPage() {
    const { data: projectsResponse, isLoading: projectsLoading } = useProjects();
    const { data: myIssues, isLoading: issuesLoading } = useMyIssues();
    const { data: recentIssues, isLoading: recentLoading } = useRecentIssues();
    const { data: starredIssues, isLoading: starredLoading } = useStarredIssues();
    const currentTenant = useTenantStore((state) => state.currentTenant);
    const projects = Array.isArray(projectsResponse) ? projectsResponse : [];


    // Mock Activity Stream
    const activities = [
        {
            id: 1,
            user: "Sahil Vadia",
            action: "commented on",
            target: "LUNA-123",
            targetType: "issue",
            time: new Date(Date.now() - 1000 * 60 * 30),
            project: "Team Luna",
            details: "I've updated the implementation details. Please review the PR attached to this issue. We need to ensure the edge cases are covered for the login flow.",
            meta: "Comment"
        },
        {
            id: 2,
            user: "Jane Smith",
            action: "moved",
            target: "LUNA-105",
            targetType: "issue",
            to: "Done",
            time: new Date(Date.now() - 1000 * 60 * 60 * 2),
            project: "Team Luna",
            details: "Moved from TEST -> DONE. QA Verification Passed.",
            meta: "Status Change"
        },
        {
            id: 3,
            user: "Mike Johnson",
            action: "created",
            target: "LUNA-142",
            targetType: "issue",
            time: new Date(Date.now() - 1000 * 60 * 60 * 5),
            project: "Team Luna",
            details: "New User Story: As a user, I want to be able to reset my password via email.",
            meta: "Creation"
        },
        {
            id: 4,
            user: "Sahil Vadia",
            action: "pushed code to",
            target: "main",
            targetType: "branch",
            time: new Date(Date.now() - 1000 * 60 * 60 * 24),
            project: "Team Luna",
            details: "feat: implemented new dashboard layout\nfix: resolved navigation glitch",
            meta: "Commit"
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your work</h1>
                <p className="text-muted-foreground mt-1">Recent projects and issues assigned to you.</p>
            </div>

            {/* Recent Spaces Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent projects</h2>
                    <Link href="/projects" className="text-sm font-medium text-blue-600 hover:underline">View all projects</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {projectsLoading ? (
                        [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
                    ) : (
                        <>
                            {projects.slice(0, 3).map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}/board`}>
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-600 h-full group bg-white">
                                        <CardHeader className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 h-10 w-10 rounded-md text-white flex items-center justify-center font-bold text-lg shadow-md">
                                                        {project.key.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base font-bold group-hover:text-blue-600 transition-colors">
                                                            {project.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs mt-0.5">
                                                            {project.key} • Software
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-0">
                                            <div className="text-xs text-muted-foreground mt-4 flex gap-3 font-medium">
                                                <span className="hover:text-blue-600 hover:underline">Board</span>
                                                <span className="hover:text-blue-600 hover:underline">Issues</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {/* Create New Space Card - Only for Owners/Admins */}
                            {(currentTenant?.role === "OWNER" || currentTenant?.role === "ADMIN") && (
                                <Card
                                    onClick={() => {
                                        if (!currentTenant) {
                                            toast.error("Please select an organization first");
                                            return;
                                        }
                                        useModalStore.getState().openCreateProject();
                                    }}
                                    className="border-dashed border-2 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center h-full text-muted-foreground hover:text-blue-600 group bg-transparent shadow-none"
                                >
                                    <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-sm">Create project</span>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="worked-on" className="w-full">
                        <div className="flex items-center justify-between border-b pb-px">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger
                                    value="worked-on"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-2.5 font-medium text-muted-foreground data-[state=active]:text-blue-600"
                                >
                                    Worked on
                                </TabsTrigger>
                                <TabsTrigger
                                    value="assigned"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-2.5 font-medium text-muted-foreground data-[state=active]:text-blue-600"
                                >
                                    Assigned to me
                                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        {myIssues?.length || 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="starred"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-2.5 font-medium text-muted-foreground data-[state=active]:text-blue-600"
                                >
                                    Starred
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="worked-on" className="mt-0">
                            <div className="bg-white rounded-b-lg border border-t-0 p-2">
                                <div className="text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">Recent Activity</div>
                                {recentLoading ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Loading activity...</div>
                                ) : recentIssues && recentIssues.length > 0 ? (
                                    recentIssues.map((issue) => (
                                        <Link key={issue.id} href={`/projects/${issue.projectId}/issues?selectedIssue=${issue.id}`}>
                                            <div className="flex items-center justify-between p-3 hover:bg-muted/40 rounded-md group cursor-pointer transition-colors border-b last:border-0">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="flex-shrink-0">
                                                        {issue.priority === 'HIGH' || issue.priority === 'CRITICAL' ? (
                                                            <div className="h-5 w-5 bg-red-100 rounded text-red-600 flex items-center justify-center"><AlertCircle className="h-3 w-3" /></div>
                                                        ) : (
                                                            <div className="h-5 w-5 bg-blue-100 rounded text-blue-600 flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate transition-colors">{issue.summary}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{issue.key}</span>
                                                            <span className="capitalize px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px]">{issue.status}</span>
                                                            <span>•</span>
                                                            <span>{formatDistanceToNow(new Date(issue.updatedAt || issue.createdAt), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 text-xs">
                                                    View
                                                </Button>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No recent work.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="assigned" className="mt-0">
                            <div className="bg-white rounded-b-lg border border-t-0 p-2">
                                {issuesLoading ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Loading issues...</div>
                                ) : myIssues && myIssues.length > 0 ? (
                                    myIssues.map((issue) => (
                                        <Link key={issue.id} href={`/projects/${issue.projectId}/issues?selectedIssue=${issue.id}`}>
                                            <div className="flex items-center justify-between p-3 hover:bg-muted/40 rounded-md group cursor-pointer transition-colors border-b last:border-0">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="flex-shrink-0">
                                                        {issue.priority === 'HIGH' || issue.priority === 'CRITICAL' ? (
                                                            <div className="h-5 w-5 bg-red-100 rounded text-red-600 flex items-center justify-center"><AlertCircle className="h-3 w-3" /></div>
                                                        ) : (
                                                            <div className="h-5 w-5 bg-blue-100 rounded text-blue-600 flex items-center justify-center"><CheckCircle2 className="h-3 w-3" /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate transition-colors">{issue.summary}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{issue.key}</span>
                                                            <span className="capitalize px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px]">{issue.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 text-xs">
                                                    Open
                                                </Button>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                                            <CheckCircle2 className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">Good job!</h3>
                                        <p className="text-sm text-muted-foreground mt-1">You have no pending issues assigned to you.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="starred" className="mt-0">
                            <div className="bg-white rounded-b-lg border border-t-0 p-2">
                                {starredLoading ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Loading starred issues...</div>
                                ) : starredIssues && starredIssues.length > 0 ? (
                                    starredIssues.map((issue) => (
                                        <Link key={issue.id} href={`/projects/${issue.projectId}/issues?selectedIssue=${issue.id}`}>
                                            <div className="flex items-center justify-between p-3 hover:bg-muted/40 rounded-md group cursor-pointer transition-colors border-b last:border-0">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="flex-shrink-0">
                                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate transition-colors">{issue.summary}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{issue.key}</span>
                                                            <span className="capitalize px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px]">{issue.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 text-xs">
                                                    Open
                                                </Button>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 mb-4">
                                            <Star className="h-6 w-6 text-yellow-400" />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">No starred issues</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Star issues to access them quickly here.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar: Activity Stream */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Activity Stream</h3>
                    <div className="space-y-6 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
                        {activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ activity }: { activity: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative flex gap-4 group">
            <div
                className={cn(
                    "absolute left-4 top-8 bottom-0 w-px bg-gray-200 transition-opacity",
                    isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )}
            />

            <Avatar
                className="h-8 w-8 border-2 border-white bg-white z-10 box-content cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <AvatarImage src={`https://github.com/shadcn.png`} />
                <AvatarFallback>{activity.user[0]}</AvatarFallback>
            </Avatar>

            <div className="space-y-1 flex-1">
                <div
                    className="cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-900">
                            <span className="font-semibold">{activity.user}</span>{" "}
                            <span className="text-muted-foreground">{activity.action}</span>{" "}
                            <span className="text-blue-600 font-medium hover:underline">{activity.target}</span>
                        </p>
                        <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 text-muted-foreground">
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {activity.targetType === 'issue' && <FileEdit className="h-3 w-3" />}
                        {activity.targetType === 'branch' && <GitCommit className="h-3 w-3" />}
                        <span>{activity.project}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(activity.time, { addSuffix: true })}</span>
                    </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                    <div className="mt-3 p-3 bg-muted/30 border rounded-md text-sm text-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {activity.action === 'commented on' ? <MessageSquare className="h-3 w-3" /> : <HistoryIcon className="h-3 w-3" />}
                            {activity.meta}
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-sm">
                            {activity.details}
                        </p>
                        <div className="mt-2 pt-2 border-t flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs">Reply</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">Like</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
