"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, GitCommit, GitPullRequest, Github, ExternalLink, RefreshCw, Plus, CheckCircle2 } from "lucide-react";

export default function ProjectDevelopmentPage() {
    return (
        <div className="space-y-6 container max-w-5xl mx-auto">
            {/* Header with integration status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-lg shadow-sm">
                        <Github className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            Connected to GitHub
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Synced
                            </Badge>
                        </h2>
                        <p className="text-sm text-muted-foreground">Repository: <span className="font-mono font-medium text-foreground">taskforge-web</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/50">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                    </Button>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Repo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Pull Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <GitPullRequest className="h-5 w-5 text-purple-500" />
                            3
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Branches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-blue-500" />
                            8
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Commits (Last 7 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <GitCommit className="h-5 w-5 text-slate-500" />
                            42
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <div className="border rounded-lg bg-card">
                    <div className="divide-y">
                        <ActivityItem
                            type="pr"
                            title="feat: Implement project board drag and drop"
                            id="#124"
                            author="Sahil Vadia"
                            status="Open"
                            time="2 hours ago"
                        />
                        <ActivityItem
                            type="branch"
                            title="fix/hydration-error-navbar"
                            id="branch"
                            author="Sahil Vadia"
                            status="Active"
                            time="4 hours ago"
                        />
                        <ActivityItem
                            type="commit"
                            title="chore: update dependencies and fix lint errors"
                            id="c8a1b24"
                            author="Jane Smith"
                            status="Pushed"
                            time="Yesterday"
                        />
                        <ActivityItem
                            type="pr"
                            title="feat: Add dark mode support"
                            id="#123"
                            author="Mike Johnson"
                            status="Merged"
                            time="2 days ago"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ type, title, id, author, status, time }: { type: "pr" | "branch" | "commit", title: string, id: string, author: string, status: string, time: string }) {
    let icon;
    if (type === "pr") icon = <GitPullRequest className="h-5 w-5 text-purple-600" />;
    if (type === "branch") icon = <GitBranch className="h-5 w-5 text-blue-600" />;
    if (type === "commit") icon = <GitCommit className="h-5 w-5 text-slate-600" />;

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${type === 'pr' ? 'bg-purple-50' : type === 'branch' ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    {icon}
                </div>
                <div>
                    <div className="font-medium flex items-center gap-2">
                        {title}
                        <span className="text-muted-foreground font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{id}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{author}</span>
                        <span>•</span>
                        <span>{time}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant={status === "Merged" ? "secondary" : status === "Open" ? "default" : "outline"} className={status === "Merged" ? "bg-purple-100 text-purple-700" : status === "Open" ? "bg-green-100 text-green-700 border-green-200" : ""}>
                    {status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
