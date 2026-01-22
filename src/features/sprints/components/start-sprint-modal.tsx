"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Sprint } from "@/features/issues/types";
import { useUpdateSprint } from "@/features/issues/hooks/use-sprints";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const startSprintSchema = z.object({
    name: z.string().min(1, "Name is required"),
    goal: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
});

interface StartSprintModalProps {
    projectId: string;
    sprint: Sprint;
}

export function StartSprintModal({ projectId, sprint }: StartSprintModalProps) {
    const [open, setOpen] = useState(false);
    const { mutateAsync: updateSprint, isPending } = useUpdateSprint();
    const router = useRouter();

    const form = useForm<z.infer<typeof startSprintSchema>>({
        resolver: zodResolver(startSprintSchema),
        defaultValues: {
            name: sprint.name,
            goal: sprint.goal || "",
            startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    });

    const onSubmit = async (values: z.infer<typeof startSprintSchema>) => {
        try {
            await updateSprint({
                sprintId: sprint.id,
                data: {
                    ...values,
                    startDate: new Date(values.startDate).toISOString(),
                    endDate: new Date(values.endDate).toISOString(),
                    status: "ACTIVE",
                },
            });
            toast.success("Sprint started successfully!");
            setOpen(false);
            // Redirect to board
            router.push(`/projects/${projectId}/board`);
        } catch (error) {
            toast.error("Failed to start sprint");
            console.error(error);
        }
    };

    if (sprint.status === "ACTIVE") {
        return <Button variant="outline" size="sm" disabled>Active</Button>;
    }

    if (sprint.status === "COMPLETED") {
        return <Button variant="ghost" size="sm" disabled>Completed</Button>;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Start Sprint</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start Sprint: {sprint.name}</DialogTitle>
                    <DialogDescription>
                        Plan your sprint range and goal.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Goal</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What do you want to achieve?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Starting..." : "Start Sprint"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
