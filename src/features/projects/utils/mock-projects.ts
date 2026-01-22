import { Project } from "../types";

export function generateMockProjects(count: number = 5): Project[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `mock-project-${i + 1}`,
        name: `Mock Project ${i + 1}`,
        key: `MP-${i + 1}`,
        description: `This is a mock project description for project ${i + 1}. It helps visualize the layout when the backend is not available.`,
        template: "KANBAN",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "mock-user-1",
    }));
}
