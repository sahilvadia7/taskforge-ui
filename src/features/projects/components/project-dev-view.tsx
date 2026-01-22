"use client";

import { useEffect, useState } from "react";
import { useDevStore, PullRequest, Branch, Commit, Repository } from "@/store/use-dev-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, GitPullRequest, GitCommit, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ProjectDevViewProps {
    projectId: string;
}

export function ProjectDevView({ projectId }: ProjectDevViewProps) {
    const { repositories, branches, pullRequests, commits, fetchData } = useDevStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData(projectId);
    }, [projectId, fetchData]);

    // Filtering
    const filteredPRs = pullRequests.filter(pr =>
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCommits = commits.filter(c =>
        c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openPRs = pullRequests.filter(pr => pr.status === "OPEN").length;
    const activeBranches = branches.filter(b => b.status === "active").length;

    return (
        <div className="flex-1 space-y-4 p-6 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Development</h2>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 w-[200px] lg:w-[300px]"
                        />
                    </div>
                    <Button>Connect Repository</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{repositories.length}</div>
                        <p className="text-xs text-muted-foreground">Connected to project</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Pull Requests</CardTitle>
                        <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openPRs}</div>
                        <p className="text-xs text-muted-foreground">Requiring review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBranches}</div>
                        <p className="text-xs text-muted-foreground">In progress work</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Build Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Passing</div>
                        <p className="text-xs text-muted-foreground">master branch</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="prs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="prs">Pull Requests</TabsTrigger>
                    <TabsTrigger value="branches">Branches</TabsTrigger>
                    <TabsTrigger value="commits">Commits</TabsTrigger>
                </TabsList>

                <TabsContent value="prs" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        {filteredPRs.map((pr, i) => (
                            <div key={pr.id} className={`flex items-center justify-between p-4 ${i !== filteredPRs.length - 1 ? 'border-b' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 ${pr.status === 'OPEN' ? 'text-green-600' : pr.status === 'MERGED' ? 'text-purple-600' : 'text-red-500'}`}>
                                        <GitPullRequest className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold hover:underline cursor-pointer">{pr.title}</span>
                                            <span className="text-muted-foreground text-sm">{pr.key}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                            <Badge variant="secondary" className="font-mono text-xs">{pr.sourceBranch}</Badge>
                                            <span>→</span>
                                            <Badge variant="outline" className="font-mono text-xs">{pr.targetBranch}</Badge>
                                            <span>•</span>
                                            <span>opened {formatDistanceToNow(new Date(pr.createdAt))} ago by {pr.author.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {pr.reviewers.map((r, idx) => (
                                            <Avatar key={idx} className={`h-8 w-8 border-2 border-background ${r.status === 'APPROVED' ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}>
                                                <AvatarImage src={r.avatarUrl} />
                                                <AvatarFallback>{r.name[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <Badge variant={pr.status === 'OPEN' ? 'default' : pr.status === 'MERGED' ? 'secondary' : 'destructive'}>
                                        {pr.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="branches" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        {filteredBranches.map((branch, i) => (
                            <div key={branch.id} className={`flex items-center justify-between p-4 ${i !== filteredBranches.length - 1 ? 'border-b' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium font-mono text-sm">{branch.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">Updated {formatDistanceToNow(new Date(branch.lastCommit))} ago by {branch.author.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Mock ahead/behind */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-green-600">3 ahead</span>
                                        <span>•</span>
                                        <span className="text-red-500">1 behind</span>
                                    </div>
                                    <Button variant="ghost" size="sm">New PR</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="commits" className="space-y-4">
                    <div className="rounded-md border bg-card">
                        {filteredCommits.map((commit, i) => (
                            <div key={commit.id} className={`flex items-center justify-between p-4 ${i !== filteredCommits.length - 1 ? 'border-b' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{commit.message}</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Avatar className="h-4 w-4">
                                                <AvatarFallback className="text-[9px]">{commit.author.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{commit.author.name}</span>
                                            <span>committed {formatDistanceToNow(new Date(commit.date))} ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{commit.hash}</code>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
