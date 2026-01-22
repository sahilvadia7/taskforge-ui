import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTenant, updateTenant, inviteTenantMember, removeTenantMember, revokeInvitation } from "../api";
import { useTenantStore } from "@/store/use-tenant-store";

export const useCreateTenant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
        },
    });
};

export const useUpdateTenant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tenantId, data }: { tenantId: string; data: { name: string } }) =>
            updateTenant(tenantId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
            queryClient.invalidateQueries({ queryKey: ["tenants", data.id] });
        },
    });
};

export const useInviteMember = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { email: string; role: "ADMIN" | "MEMBER" }) =>
            inviteTenantMember(tenantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
        },
    });
};

export const useRemoveMember = (tenantId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => removeTenantMember(tenantId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
        },
    });
};

export const useRevokeInvitation = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invitationId: string) => {
            return revokeInvitation(invitationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "invitations"] });
        },
    });
};
