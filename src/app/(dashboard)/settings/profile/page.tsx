"use client";

import { Separator } from "@/components/ui/separator";
import { useMe, useUpdateProfile } from "@/features/users/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export default function SettingsProfilePage() {
    const { data: user, isLoading } = useMe();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                displayName: user.displayName || "",
            });
        }
    }, [user, form]);

    const onSubmit = (values: z.infer<typeof profileSchema>) => {
        updateProfile(values, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
            },
            onError: () => {
                toast.error("Failed to update profile");
            },
        });
    };

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
        </div>;
    }

    if (!user) {
        return <div>Failed to load profile.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your public profile settings.
                </p>
            </div>
            <Separator />

            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-lg">{user.displayName?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-medium text-lg">{user.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid gap-2">
                        <FormLabel>Email</FormLabel>
                        <Input value={user.email} disabled className="bg-muted text-muted-foreground" />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Email cannot be changed.
                        </p>
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
