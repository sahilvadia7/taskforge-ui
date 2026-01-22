import { useQuery } from "@tanstack/react-query";
import { getTenants, getTenant, getTenantMembers, TenantMember, getTenantInvitations, TenantInvitation } from "../api";
import { Tenant, useTenantStore } from "@/store/use-tenant-store";

export const useTenants = () => {
    return useQuery<Tenant[]>({
        queryKey: ["tenants"],
        queryFn: getTenants,
    });
};

export const useTenant = (tenantId?: string) => {
    return useQuery<Tenant>({
        queryKey: ["tenants", tenantId],
        queryFn: async () => {
            return getTenant(tenantId!);
        },
        enabled: !!tenantId,
    });
};

export const useTenantMembers = (tenantId?: string) => {
    return useQuery<TenantMember[]>({
        queryKey: ["tenants", tenantId, "members"],
        queryFn: async () => {
            return getTenantMembers(tenantId!);
        },
        enabled: !!tenantId,
    });
};

export const useTenantInvitations = (tenantId?: string) => {
    const { currentTenant } = useTenantStore();
    const canViewInvitations = currentTenant?.role === "OWNER" || currentTenant?.role === "ADMIN";

    return useQuery<TenantInvitation[]>({
        queryKey: ["tenants", tenantId, "invitations"],
        queryFn: async () => {
            return getTenantInvitations(tenantId!);
        },
        enabled: !!tenantId && canViewInvitations,
    });
};
