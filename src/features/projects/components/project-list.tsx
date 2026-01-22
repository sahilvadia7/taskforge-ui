"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useModalStore } from "@/store/use-modal-store"; // Add import

export function ProjectList() {
    const { data: projectsResponse, isLoading, error } = useProjects();
    const { openCreateProject } = useModalStore(); // Add hook usage

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[180px] rounded-xl border border-border/40 bg-muted/20 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-destructive/20 bg-destructive/5 text-destructive">
                <p>Failed to load projects</p>
            </div>
        );
    }
    const projects = Array.isArray(projectsResponse) ? projectsResponse : [];

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">No projects found</h3>
                <p className="mb-4 text-muted-foreground">
                    Get started by creating your first project.
                </p>
                <Button onClick={openCreateProject}>
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.key}`} className="block h-full">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg truncate pr-2" title={project.name}>{project.name}</CardTitle>
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded shrink-0">
                                    {project.key}
                                </span>
                            </div>
                            <CardDescription>
                                Created {new Date(project.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {project.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
