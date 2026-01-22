"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTenantStore } from "@/store/use-tenant-store";
import { useUpdateTenant, useInviteMember, useRemoveMember } from "../hooks/use-tenant-mutations";
import { useTenantMembers, useTenantInvitations } from "../hooks/use-tenants";
import { useRevokeInvitation } from "../hooks/use-tenant-mutations";
import { Mail, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const updateTenantSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
});

const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MEMBER"]),
});

export function TenantSettings() {
    const { currentTenant } = useTenantStore();
    const { mutate: updateTenant, isPending: isUpdating } = useUpdateTenant();

    const form = useForm<z.infer<typeof updateTenantSchema>>({
        resolver: zodResolver(updateTenantSchema),
        values: {
            name: currentTenant?.name || "",
        },
    });

    const onSubmit = (values: z.infer<typeof updateTenantSchema>) => {
        if (!currentTenant) return;
        updateTenant(
            { tenantId: currentTenant.id, data: values },
            {
                onSuccess: () => {
                    toast.success("Workspace updated successfully");
                },
                onError: () => {
                    toast.error("Failed to update workspace");
                },
            }
        );
    };

    if (!currentTenant) return null;

    const isAdmin = currentTenant.role === "ADMIN" || currentTenant.role === "OWNER";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Workspace Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your workspace settings and members.
                </p>
                <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono text-slate-600">
                    DEBUG: TenantID: {currentTenant.id} | Name: {currentTenant.name} | Role: {currentTenant.role || "UNDEFINED"}
                </div>
            </div>
            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Name</CardTitle>
                            <CardDescription>
                                This is the name of your workspace visible to your team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} disabled={!isAdmin} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {isAdmin && (
                                        <div className="flex justify-start">
                                            <Button type="submit" disabled={isUpdating}>
                                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                    {!isAdmin && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Only admins can update workspace details.
                                        </p>
                                    )}
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Members & Invitations</CardTitle>
                            <CardDescription>
                                Manage who has access to this workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <InvitationList tenantId={currentTenant.id} isAdmin={isAdmin} />
                            <MemberList isAdmin={isAdmin} tenantId={currentTenant.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MemberList({ isAdmin, tenantId }: { isAdmin: boolean; tenantId: string }) {
    const { data: members, isLoading } = useTenantMembers(tenantId);
    const { mutate: removeMember } = useRemoveMember(tenantId);
    const { mutate: inviteMember, isPending: isInviting } = useInviteMember(tenantId);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const inviteForm = useForm<z.infer<typeof inviteMemberSchema>>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: "",
            role: "MEMBER",
        },
    });

    const onInvite = (values: z.infer<typeof inviteMemberSchema>) => {
        inviteMember(values, {
            onSuccess: () => {
                toast.success("Member invited successfully");
                setIsInviteOpen(false);
                inviteForm.reset();
            },
            onError: () => {
                toast.error("Failed to invite member");
            },
        });
    };

    if (isLoading) {
        return <div>Loading members...</div>;
    }

    return (
        <div className="space-y-6">
            {isAdmin && (
                <div className="flex justify-end">
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button>Invite Member</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Member</DialogTitle>
                                <DialogDescription>
                                    Invite a new member to your workspace.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...inviteForm}>
                                <form onSubmit={inviteForm.handleSubmit(onInvite)} className="space-y-4">
                                    <FormField
                                        control={inviteForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="colleague@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={inviteForm.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MEMBER">Member</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={isInviting}>
                                            {isInviting ? "Inviting..." : "Send Invite"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <div className="space-y-4">
                {members?.map((member, i) => (
                    <div key={member.userId || i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={member.avatarUrl || undefined} />
                                <AvatarFallback>{(member.displayName || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.displayName}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground capitalize bg-secondary px-2 py-1 rounded">
                                {member.role.toLowerCase()}
                            </span>
                            {isAdmin && member.role !== "OWNER" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to remove this member?")) {
                                            removeMember(member.userId);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}



function InvitationList({ tenantId, isAdmin }: { tenantId: string; isAdmin: boolean }) {
    const { data: invitations, isLoading } = useTenantInvitations(tenantId);
    const { mutate: revoke, isPending } = useRevokeInvitation(tenantId);

    if (isLoading) return null;
    if (!invitations || invitations.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Pending Invitations
            </h4>
            <div className="space-y-2">
                {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{inv.email}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded capitalize">
                                        {inv.role.toLowerCase()}
                                    </span>
                                    <span>• Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                onClick={() => {
                                    if (confirm("Revoke this invitation?")) {
                                        revoke(inv.id);
                                    }
                                }}
                                disabled={isPending}
                            >
                                Revoke
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
