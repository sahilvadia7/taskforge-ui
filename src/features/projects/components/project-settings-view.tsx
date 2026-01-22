"use client";

import { getInitials } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectMembers, useAddProjectMember } from "../hooks/useProjects";
import { useTenantMembers } from "@/features/tenants/hooks/use-tenants";
import { useTenantStore } from "@/store/use-tenant-store";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

const projectFormSchema = z.object({
    name: z.string().min(2, "Project name must be at least 2 characters."),
    key: z.string().min(2, "Key must be at least 2 characters."),
    description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectSettingsView() {
    const params = useParams();
    const projectId = params.projectId as string;
    const router = useRouter();

    const { data: project, isLoading } = useProject(projectId);
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
    const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            name: "",
            key: "",
            description: "",
        },
    });

    // Populate form when data loads
    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                key: project.key,
                description: project.description || "",
            });
        }
    }, [project, form]);

    function onSubmit(data: ProjectFormValues) {
        updateProject(
            { projectId, data },
            {
                onSuccess: () => toast.success("Settings updated successfully"),
                onError: () => toast.error("Failed to update settings"),
            }
        );
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            deleteProject(projectId, {
                onSuccess: () => {
                    toast.success("Project deleted");
                    router.push("/projects");
                },
                onError: () => toast.error("Failed to delete project"),
            });
        }
    };

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-64 w-full" />
        </div>;
    }

    if (!project) return <div>Project not found.</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h3 className="text-lg font-medium">Project Details</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your project settings and configurations.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Information</CardTitle>
                                    <CardDescription>Basic details about your project.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Project Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="key"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Key</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="KEY" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Used for issue prefixes (e.g. KEY-123).
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-600/80">
                                Irreversible actions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-900">Delete Project</p>
                                    <p className="text-sm text-red-700">
                                        Once deleted, it will be gone forever.
                                    </p>
                                </div>
                                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete Project"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members">
                    <ProjectMembersList projectId={projectId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ProjectMembersList({ projectId }: { projectId: string }) {
    const { data: projectMembers, isLoading: isProjectMembersLoading } = useProjectMembers(projectId);
    const { currentTenant } = useTenantStore();
    const { data: tenantMembers } = useTenantMembers(currentTenant?.id);
    const { mutate: addMember, isPending: isAdding } = useAddProjectMember(projectId);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Filter out members already in the project
    const availableMembers = tenantMembers?.filter(tm =>
        !projectMembers?.some(pm => pm.userId === tm.userId)
    ) || [];

    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<"CONTRIBUTOR" | "MANAGER" | "QA" | "VIEWER">("CONTRIBUTOR");

    // Reset selection when dialog opens
    useEffect(() => {
        if (isAddOpen) {
            setSelectedUserId("");
            setSelectedRole("CONTRIBUTOR");
        }
    }, [isAddOpen]);

    const handleAddMember = () => {
        if (!selectedUserId) return;

        // Find the selected tenant member to get their email
        const selectedMember = tenantMembers?.find(tm => tm.userId === selectedUserId);
        if (!selectedMember) return;

        addMember({
            email: selectedMember.email,
            role: selectedRole
        }, {
            onSuccess: () => {
                toast.success("Member added to project");
                setIsAddOpen(false);
            },
            onError: () => toast.error("Failed to add member")
        });
    };

    if (isProjectMembersLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>;
    }

    const canAddMembers = currentTenant?.role === "ADMIN" || currentTenant?.role === "OWNER";

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Project Members</CardTitle>
                        <CardDescription>Manage who has access to this project.</CardDescription>
                    </div>
                    {canAddMembers && (
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Team Member</DialogTitle>
                                    <DialogDescription>
                                        Select a member from your workspace to add to this project.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Member</label>
                                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a member..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableMembers.length === 0 ? (
                                                    <SelectItem value="none" disabled>No available members found</SelectItem>
                                                ) : (
                                                    availableMembers.map(member => (
                                                        <SelectItem key={member.userId} value={member.userId}>
                                                            {member.displayName} ({member.email})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                                                <SelectItem value="QA">QA</SelectItem>
                                                <SelectItem value="VIEWER">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddMember} disabled={!selectedUserId || isAdding}>
                                        {isAdding ? "Adding..." : "Add Member"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projectMembers && projectMembers.length > 0 ? (
                        projectMembers.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Avatar className="cursor-help" title={member.displayName}>
                                        <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                                        {member.role.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No members in this project yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
