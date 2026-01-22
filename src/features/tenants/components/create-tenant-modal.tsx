"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useModalStore } from "@/store/use-modal-store";
import { useCreateTenant } from "../hooks/use-tenant-mutations";
import { useTenantStore } from "@/store/use-tenant-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Workspace name is required").max(50),
});

export function CreateTenantModal() {
    const { isCreateTenantOpen, closeCreateTenant } = useModalStore();
    const { mutate: createTenant, isPending } = useCreateTenant();
    const { setTenant } = useTenantStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createTenant(
            { name: values.name },
            {
                onSuccess: (data) => {
                    toast.success("Workspace created successfully");
                    setTenant(data);
                    closeCreateTenant();
                    form.reset();
                },
                onError: () => {
                    toast.error("Failed to create workspace");
                },
            }
        );
    };

    return (
        <Dialog open={isCreateTenantOpen} onOpenChange={closeCreateTenant}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Create a new workspace to organize your projects and team.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCreateTenant}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create Workspace"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
