"use client";

import { useModalStore } from "@/store/use-modal-store";
import { useCreateProject } from "../hooks/useProjects";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { LayoutDashboard, Kanban, Bug } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectTemplate, ALL_PROJECT_TEMPLATES } from "@/features/projects/types";

export function CreateProjectModal() {
    const { isCreateProjectOpen, closeCreateProject } = useModalStore();
    const router = useRouter();
    const { mutate: createProject, isPending } = useCreateProject();

    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [template, setTemplate] = useState<ProjectTemplate>("KANBAN");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProject(
            { name, key, description, template },
            {
                onSuccess: (data) => {
                    toast.success("Project created successfully");
                    closeCreateProject();
                    setName("");
                    setKey("");
                    setDescription("");
                    setTemplate("KANBAN");
                    // Redirect to the new project board or list
                    router.push(`/projects/${data.id}`);
                },
                onError: () => {
                    toast.error("Failed to create project");
                }
            }
        );
    };

    return (
        <Dialog open={isCreateProjectOpen} onOpenChange={(open) => !open && closeCreateProject()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Marketing Launch"
                            required
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="key">Key <span className="text-red-500">*</span></Label>
                        <Input
                            id="key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="e.g. MKT"
                            required
                            className="uppercase"
                            maxLength={10}
                        />
                        <p className="text-xs text-muted-foreground">Unique key to identify issues (e.g. MKT-123)</p>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="template">Template</Label>
                        <Select value={template} onValueChange={(v) => setTemplate(v as ProjectTemplate)}>
                            <SelectTrigger id="template">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="KANBAN">
                                    <div className="flex items-center gap-2">
                                        <Kanban className="w-4 h-4 text-blue-500" />
                                        <span>Kanban</span>
                                        <span className="text-xs text-muted-foreground ml-2">(Visual flow)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="SCRUM">
                                    <div className="flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-green-500" />
                                        <span>Scrum</span>
                                        <span className="text-xs text-muted-foreground ml-2">(Sprints)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="BUG">
                                    <div className="flex items-center gap-2">
                                        <Bug className="w-4 h-4 text-red-500" />
                                        <span>Bug Tracking</span>
                                        <span className="text-xs text-muted-foreground ml-2">(List focused)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the project goals..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeCreateProject} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Project"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
