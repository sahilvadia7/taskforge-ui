import { apiClient } from "@/lib/api-client";

export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
}

export const getMe = async (): Promise<User> => {
    const response = await apiClient.get<User>("/me");
    return response.data;
};

export interface UpdateProfileRequest {
    displayName: string;
}

export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.patch<User>("/me", data);
    return response.data;
};
