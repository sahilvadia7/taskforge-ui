"use client";

import { ProjectList } from "@/features/projects/components/project-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useModalStore } from "@/store/use-modal-store";
import { useTenantStore } from "@/store/use-tenant-store";

export default function ProjectsPage() {
    const { openCreateProject } = useModalStore();
    const { currentTenant } = useTenantStore();

    const canCreate = currentTenant?.role === "OWNER" || currentTenant?.role === "ADMIN";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">
                        Manage your projects and tasks perfectly.
                    </p>
                </div>
                {canCreate && (
                    <Button onClick={openCreateProject}>
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                )}
            </div>
            <ProjectList />
        </div>
    );
}
