"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useSearch } from "../hooks/use-search";
import { FileText, FolderKanban, Bug, CheckCircle2, Bookmark, Activity, Loader2 } from "lucide-react";

interface SearchCommandProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();
    const { data, isLoading } = useSearch(query);

    // Reset query when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery("");
        }
    }, [open]);

    const handleSelect = useCallback((type: string, id: string, projectId?: string) => {
        onOpenChange(false);
        switch (type) {
            case "issue":
                router.push(`/projects/${projectId}/board?issue=${id}`);
                break;
            case "project":
                router.push(`/projects/${id}/summary`);
                break;
            case "page":
                router.push(`/projects/${projectId}/pages/${id}`);
                break;
        }
    }, [router, onOpenChange]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "EPIC": return <Activity className="h-4 w-4 text-purple-500" />;
            case "STORY": return <Bookmark className="h-4 w-4 text-green-500" />;
            case "BUG": return <Bug className="h-4 w-4 text-red-500" />;
            case "TASK": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            default: return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const hasResults = data && (data.issues.length > 0 || data.projects.length > 0 || data.pages.length > 0);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
            <CommandInput
                placeholder="Search issues, projects, pages..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {isLoading && query.length >= 2 && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && query.length >= 2 && !hasResults && (
                    <CommandEmpty>No results found for "{query}"</CommandEmpty>
                )}

                {query.length < 2 && (
                    <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                )}

                {data && data.issues.length > 0 && (
                    <CommandGroup heading="Issues">
                        {data.issues.map((issue) => (
                            <CommandItem
                                key={issue.id}
                                value={`issue-${issue.id}`}
                                onSelect={() => handleSelect("issue", issue.id, issue.projectId)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                {getTypeIcon(issue.type)}
                                <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
                                <span className="truncate">{issue.summary}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {data && data.projects.length > 0 && (
                    <CommandGroup heading="Projects">
                        {data.projects.map((project) => (
                            <CommandItem
                                key={project.id}
                                value={`project-${project.id}`}
                                onSelect={() => handleSelect("project", project.id)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <FolderKanban className="h-4 w-4 text-blue-500" />
                                <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
                                <span className="truncate">{project.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {data && data.pages.length > 0 && (
                    <CommandGroup heading="Pages">
                        {data.pages.map((page) => (
                            <CommandItem
                                key={page.id}
                                value={`page-${page.id}`}
                                onSelect={() => handleSelect("page", page.id, page.projectId)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <FileText className="h-4 w-4 text-orange-500" />
                                <span className="truncate">{page.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
