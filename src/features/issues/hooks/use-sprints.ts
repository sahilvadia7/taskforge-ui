import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sprintApi, CreateSprintRequest, UpdateSprintRequest } from "../api/sprints";

export function useSprints(projectId: string) {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sprints", projectId],
        queryFn: () => sprintApi.getSprints(projectId),
        enabled: !!projectId,
    });

    const createSprintMutation = useMutation({
        mutationFn: (data: CreateSprintRequest) => sprintApi.createSprint(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
        },
    });

    const updateSprintMutation = useMutation({
        mutationFn: ({ sprintId, data }: { sprintId: string; data: UpdateSprintRequest }) =>
            sprintApi.updateSprint(sprintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
            queryClient.invalidateQueries({ queryKey: ["issues", projectId] }); // Issues might have changed sprint state? Not really, but good practice.
        },
    });

    const deleteSprintMutation = useMutation({
        mutationFn: (sprintId: string) => sprintApi.deleteSprint(sprintId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
            queryClient.invalidateQueries({ queryKey: ["issues", projectId] }); // Filtered issues might change
        },
    });

    return {
        sprints: data,
        isLoading,
        error,
        createSprint: createSprintMutation.mutateAsync,
        updateSprint: updateSprintMutation.mutateAsync,
        deleteSprint: deleteSprintMutation.mutateAsync,
    };
}

export function useCreateSprint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: CreateSprintRequest }) =>
            sprintApi.createSprint(projectId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sprints", variables.projectId] });
        },
    });
}

export function useUpdateSprint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sprintId, data }: { sprintId: string; data: UpdateSprintRequest }) =>
            sprintApi.updateSprint(sprintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
        },
    });
}

