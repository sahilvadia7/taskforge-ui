import { apiClient } from "@/lib/api-client";
import { Sprint } from "@/features/issues/types";

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  status?: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  endDate?: string;
}

export const sprintApi = {
  getSprints: async (projectId: string): Promise<Sprint[]> => {
    const response = await apiClient.get<Sprint[]>(`/projects/${projectId}/sprints`);
    return response.data;
  },

  createSprint: async (projectId: string, data: CreateSprintRequest): Promise<Sprint> => {
    const response = await apiClient.post<Sprint>(`/projects/${projectId}/sprints`, data);
    return response.data;
  },

  updateSprint: async (sprintId: string, data: UpdateSprintRequest): Promise<Sprint> => {
    const response = await apiClient.patch<Sprint>(`/sprints/${sprintId}`, data);
    return response.data;
  },

  deleteSprint: async (sprintId: string): Promise<void> => {
    await apiClient.delete(`/sprints/${sprintId}`);
  },
};
