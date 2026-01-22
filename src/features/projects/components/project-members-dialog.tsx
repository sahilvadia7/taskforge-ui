"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectMembers } from "../hooks/useProjects";
import { inviteProjectMember } from "../api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/store/use-tenant-store";
import { getInitials } from "@/lib/utils";

const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["MANAGER", "CONTRIBUTOR", "QA", "VIEWER"]),
});

interface ProjectMembersDialogProps {
    projectId: string;
}

export function ProjectMembersDialog({ projectId }: ProjectMembersDialogProps) {
    const { data: members, isLoading } = useProjectMembers(projectId);
    const [isOpen, setIsOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const queryClient = useQueryClient();
    const { currentTenant } = useTenantStore();

    const isAdmin = currentTenant?.role === "ADMIN" || currentTenant?.role === "OWNER";

    const form = useForm<z.infer<typeof inviteSchema>>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: "",
            role: "CONTRIBUTOR",
        },
    });

    const onInvite = async (values: z.infer<typeof inviteSchema>) => {
        setIsInviting(true);
        try {
            await inviteProjectMember(projectId, {
                ...values,
                email: values.email.trim(),
            });

            toast.success("Member added to project");
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
        } catch (error: any) {
            console.error("Failed to add member", error);

            if (error.response?.status === 404) {
                toast.error("Invite User API not implemented yet on backend.");
            } else if (error.response?.data?.errorCode === "USER_NOT_FOUND") {
                toast.error(
                    "User not found in this workspace. Please invite them to the workspace first."
                );
            } else if (error.response?.data) {
                const serverError = error.response.data;
                const message = typeof serverError === "string"
                    ? serverError
                    : serverError.message || JSON.stringify(serverError);
                toast.error(message);
            } else {
                toast.error("Failed to add member to project.");
            }
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                    <Users className="h-4 w-4" />
                    Members
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Project Members</DialogTitle>
                    <DialogDescription>
                        Manage who has access to this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* Invite Form - Only for Admins */}
                    {isAdmin && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                                    <div className="grid grid-cols-[1fr,130px] gap-2">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs">Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="user@example.com" className="h-9" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs">Role</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="MANAGER">Manager</SelectItem>
                                                            <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                                                            <SelectItem value="QA">QA</SelectItem>
                                                            <SelectItem value="VIEWER">Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" size="sm" disabled={isInviting}>
                                            {isInviting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                            <UserPlus className="mr-2 h-3 w-3" />
                                            Add to Project
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}

                    {/* Member List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Team Members</h4>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    Loading members...
                                </div>
                            ) : members && members.length > 0 ? (
                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 text-xs cursor-help" title={member.displayName}>
                                                    <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0.5">
                                                    <span className="text-sm font-medium leading-none">{member.displayName}</span>
                                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono">
                                                    {member.role}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                    <Users className="h-8 w-8 opacity-20" />
                                    <p className="text-sm">No members found.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
