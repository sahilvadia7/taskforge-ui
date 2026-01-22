import { apiClient } from "@/lib/api-client";
import { Tenant } from "@/store/use-tenant-store";

export interface CreateTenantRequest {
    name: string;
}

export interface UpdateTenantRequest {
    name: string;
}

export interface TenantMember {
    userId: string;
    displayName: string;
    email: string;
    role: "ADMIN" | "MEMBER" | "OWNER";
    avatarUrl?: string | null;
}

export interface InviteMemberRequest {
    email: string;
    role: "ADMIN" | "MEMBER";
}

export const getTenants = async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>("/tenants");
    return response.data;
};

export const getTenant = async (tenantId: string): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
    return response.data;
};

export const createTenant = async (data: CreateTenantRequest): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>("/tenants", data);
    return response.data;
};

export const updateTenant = async (tenantId: string, data: UpdateTenantRequest): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${tenantId}`, data);
    return response.data;
};

export const getTenantMembers = async (tenantId: string): Promise<TenantMember[]> => {
    const response = await apiClient.get<TenantMember[]>(`/tenants/${tenantId}/members`);
    return response.data;
};

export const inviteTenantMember = async (tenantId: string, data: InviteMemberRequest): Promise<void> => {
    await apiClient.post(`/tenants/${tenantId}/members`, data);
};

export const removeTenantMember = async (tenantId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/members/${userId}`);
};

export const acceptInvitation = async (token: string): Promise<{ tenantId: string }> => {
    const response = await apiClient.post<{ tenantId: string }>("/invitations/accept", { token });
    return response.data;
};
export interface TenantInvitation {
    id: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    token: string;
    expiresAt: string;
}

export interface InvitationDetailsResponse {
    email: string;
    role: string;
    tenantName: string;
    inviterName: string;
    inviterEmail: string;
}

export const getInvitationDetails = async (token: string): Promise<InvitationDetailsResponse> => {
    const response = await apiClient.get<InvitationDetailsResponse>(`/invitations/${token}`);
    return response.data;
};

// Removed duplicate acceptInvitation

export const getTenantInvitations = async (tenantId: string): Promise<TenantInvitation[]> => {
    const response = await apiClient.get<TenantInvitation[]>(`/tenants/${tenantId}/invitations`);
    return response.data;
};

export const revokeInvitation = async (invitationId: string): Promise<void> => {
    await apiClient.delete(`/invitations/${invitationId}`);
};
