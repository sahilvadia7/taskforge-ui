import { Issue, IssuePriority, IssueStatus, IssueType, User } from "../types";
import { addDays, subDays } from "date-fns";

export const USERS: User[] = [
    { id: "u1", name: "Alex Chen", avatarUrl: "" },
    { id: "u2", name: "Sarah Jones", avatarUrl: "" },
    { id: "u3", name: "Mike Smith", avatarUrl: "" },
    { id: "u4", name: "Emily Davis", avatarUrl: "" },
    { id: "u5", name: "David Wilson", avatarUrl: "" },
];

const ISSUE_TYPES: IssueType[] = ["TASK", "BUG", "STORY", "EPIC"];
const PRIORITIES: IssuePriority[] = ["BLOCKER", "CRITICAL", "URGENT", "HIGH", "MEDIUM", "LOW", "LOWEST"];
const STATUSES: IssueStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export const generateMockIssues = (projectId: string, count: number = 20): Issue[] => {
    return Array.from({ length: count }).map((_, i) => {
        const type = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
        const isEpic = type === "EPIC";
        const reporter = USERS[Math.floor(Math.random() * USERS.length)];
        const assignee = Math.random() > 0.3 ? USERS[Math.floor(Math.random() * USERS.length)] : undefined;

        const now = new Date();
        const created = subDays(now, Math.floor(Math.random() * 30));

        // Epics usually have dates
        let startDate, dueDate;
        if (isEpic || Math.random() > 0.7) {
            startDate = addDays(now, Math.floor(Math.random() * 10) - 5).toISOString();
            dueDate = addDays(now, Math.floor(Math.random() * 20) + 10).toISOString();
        }

        return {
            id: `ISSUE-${projectId}-${i}`,
            key: `${projectId}-${i + 1}`,
            summary: isEpic ? `Epic Goal ${i}: ${['Refactor', 'Migration', 'New Feature', 'Q4 Goals'][i % 4]}` : `Issue summary ${i} for ${projectId}`,
            description: "This is a detailed description of the issue. It supports markdown and contains relevant context.",
            type,
            status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
            priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
            reporter,
            assignee,
            projectId,
            startDate,
            dueDate,
            createdAt: created.toISOString(),
            updatedAt: created.toISOString(),
            storyPoints: Math.floor(Math.random() * 13),
            comments: []
        };
    });
};

export const MOCK_ISSUES: Issue[] = generateMockIssues("DEMO", 10);
