"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTenantStore } from "@/store/use-tenant-store";
import { useTenants } from "@/features/tenants/hooks/use-tenants";
import { useCreateTenant } from "@/features/tenants/hooks/use-tenant-mutations";
import { Tenant } from "@/store/use-tenant-store";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export default function OnboardingPage() {
    const { status } = useSession();
    const router = useRouter();
    const { setTenant } = useTenantStore();

    // Real API Hooks
    const { data: tenants = [], isLoading: isLoadingTenants } = useTenants();
    const { mutateAsync: createTenant, isPending: isCreating } = useCreateTenant();

    const [newOrgName, setNewOrgName] = useState("");

    // Auth Redirect
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;

        try {
            const newTenant = await createTenant({ name: newOrgName });

            // CRITICAL: Set the real tenant from API response into the store
            // This ensures subsequent requests use the correct X-Tenant-Id
            setTenant(newTenant);

            toast.success("Organization created successfully");
            router.push("/dashboard");

        } catch (error) {
            console.error("Failed to create org", error);
            toast.error("Failed to create organization. Please try again.");
        }
    };


    const handleSelectOrg = (tenant: Tenant) => {
        setTenant(tenant);
        router.push("/dashboard");
    };

    if (status === "loading" || isLoadingTenants) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
                    <p className="mt-2 text-zinc-500">Loading your organizations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-black">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">

                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {tenants.length > 0 ? "Select Organization" : "Welcome to TaskForge"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {tenants.length > 0
                            ? "Choose an organization to continue."
                            : "You don't belong to any organizations yet. Create one to get started."}
                    </p>
                </div>

                {/* LIST EXISTING TENANTS */}
                {tenants.length > 0 && (
                    <div className="space-y-3">
                        {tenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => handleSelectOrg(tenant)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{tenant.name}</span>
                                    <span className="text-xs text-gray-500">{tenant.role}</span>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400">→</span>
                            </button>
                        ))}

                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                    </div>
                )}

                {/* CREATE NEW ORG FORM */}
                <form onSubmit={handleCreateOrg} className="space-y-4">
                    <div>
                        <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Create New Organization
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="orgName"
                                value={newOrgName}
                                onChange={(e) => setNewOrgName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:text-sm p-3 border"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isCreating ? "Creating..." : "Create Organization"}
                    </button>

                </form>

            </div>
        </div>
    );
}
