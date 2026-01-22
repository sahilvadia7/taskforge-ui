"use client";

import { useModalStore } from "@/store/use-modal-store";
import { useCreateIssue, useIssues } from "../hooks/use-issues";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IssueType, ALL_ISSUE_TYPES, IssuePriority, ALL_ISSUE_PRIORITIES, Issue } from "../types";
import { useState, useEffect } from "react";
import { CheckSquare, Bug, Bookmark, LayoutList } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useProjects } from "../../projects/hooks/useProjects";

export function CreateIssueModal() {
    const { isCreateIssueOpen, closeCreateIssue, issueDefaults } = useModalStore();
    const { mutate: createIssue, isPending } = useCreateIssue();
    const { data: session } = useSession();

    const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects();
    const projects = projectsResponse || [];

    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<IssueType>("TASK");
    const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
    const [projectId, setProjectId] = useState(issueDefaults?.projectId || ""); // Fallback to provided ref ID

    useEffect(() => {
        if (isCreateIssueOpen && issueDefaults?.projectId) {
            setProjectId(issueDefaults.projectId);
        }
    }, [isCreateIssueOpen, issueDefaults]);

    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [dueDate, setDueDate] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isCreateIssueOpen) {

            setDueDate(issueDefaults?.dueDate);
            setStartDate(issueDefaults?.startDate);
            if (issueDefaults?.type) {
                setType(issueDefaults.type);
            } else {
                setType("TASK");
            }
            setPriority("MEDIUM");
            setParentId(issueDefaults?.parentId);
        }
    }, [isCreateIssueOpen, issueDefaults]);

    const [parentId, setParentId] = useState<string | undefined>(undefined);

    const { data: projectIssues = [] } = useIssues(projectId);

    const availableParents = projectIssues.filter(issue => {
        if (type === "STORY") return issue.type === "EPIC";
        if (type === "TASK" || type === "BUG") return issue.type === "STORY";
        return false;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) {
            return;
        }


        createIssue({
            projectId,
            title: summary,
            description,
            type,
            priority,
            startDate,
            dueDate,
            assigneeId: session?.user?.id,
            parentId,
        }, {
            onSuccess: () => {
                toast.success("Issue created");
                closeCreateIssue();
                setSummary("");
                setDescription("");
                setDueDate(undefined);
                setStartDate(undefined);
                setType("TASK");
                setPriority("MEDIUM");
                setParentId(undefined);
            },
            onError: () => {
                toast.error("Failed to create issue");
            }
        });
    };

    return (
        <Dialog open={isCreateIssueOpen} onOpenChange={(open) => !open && closeCreateIssue()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Issue</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new issue.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="project">Project</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger id="project">
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingProjects ? (
                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                    projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name} ({project.key})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="type">Issue Type</Label>
                            <Select value={type} onValueChange={(v) => setType(v as IssueType)}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TASK">
                                        <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-500" /> Task</div>
                                    </SelectItem>
                                    <SelectItem value="BUG">
                                        <div className="flex items-center gap-2"><Bug className="w-4 h-4 text-red-500" /> Bug</div>
                                    </SelectItem>
                                    <SelectItem value="STORY">
                                        <div className="flex items-center gap-2"><Bookmark className="w-4 h-4 text-green-500" /> Story</div>
                                    </SelectItem>
                                    <SelectItem value="EPIC">
                                        <div className="flex items-center gap-2"><LayoutList className="w-4 h-4 text-purple-500" /> Epic</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_ISSUE_PRIORITIES.map(p => (
                                        <SelectItem key={p} value={p}>
                                            {p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {(type === "STORY" || type === "TASK" || type === "BUG") && (
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="parent">Parent {type === "STORY" ? "Epic" : "Story"}</Label>
                            <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? undefined : v)}>
                                <SelectTrigger id="parent">
                                    <SelectValue placeholder={`Select Parent ${type === "STORY" ? "Epic" : "Story"} (Optional)`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {availableParents.map((parent: Issue) => (
                                        <SelectItem key={parent.id} value={parent.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-muted-foreground">{parent.key}</span>
                                                <span className="truncate max-w-[300px]">{parent.summary}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {availableParents.length === 0 && (
                                        <div className="p-2 text-xs text-muted-foreground text-center">
                                            No eligible parent issues found
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label>Start Date</Label>
                            <DatePicker
                                date={startDate ? new Date(startDate) : undefined}
                                setDate={(date) => setStartDate(date?.toISOString())}
                                placeholder="Start date"
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label>Due Date</Label>
                            <DatePicker
                                date={dueDate ? new Date(dueDate) : undefined}
                                setDate={(date) => setDueDate(date?.toISOString())}
                                placeholder="Due date"
                            />
                        </div>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="summary">Summary <span className="text-red-500">*</span></Label>
                        <Input
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="What needs to be done?"
                            required
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeCreateIssue} disabled={isPending}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
