import { usePageStore, Page } from "@/store/use-page-store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, FileText, Plus, MoreHorizontal, Trash2, FolderOpen, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface PageTreeSidebarProps {
    projectId: string;
}

export function PageTreeSidebar({ projectId }: PageTreeSidebarProps) {
    const { pages, selectedPageId, setSelectedPageId, toggleNode, expandedNodes, createPage, deletePage } = usePageStore();
    const [searchQuery, setSearchQuery] = useState("");

    const projectPages = pages.filter(p => p.projectId === projectId);

    // Sort logic? Maybe by title or creation. Default creation.
    const sortedPages = [...projectPages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const rootPages = sortedPages.filter(p => !p.parentId);

    // Search Logic: If searching, ignore hierarchy and show flat list
    const filteredPages = searchQuery
        ? sortedPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : rootPages;

    const handleCreatePage = (parentId: string | null = null) => {
        createPage(projectId, {
            title: "Untitled Page",
            content: "",
            parentId,
            icon: "📄"
        });
        if (parentId && !expandedNodes.includes(parentId)) {
            toggleNode(parentId);
        }
    };

    const renderNode = (page: Page, level: number = 0) => {
        const children = sortedPages.filter(p => p.parentId === page.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedNodes.includes(page.id);
        const isSelected = selectedPageId === page.id;

        return (
            <div key={page.id}>
                <div
                    className={cn(
                        "group flex items-center h-8 px-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm mb-0.5",
                        isSelected && "bg-muted font-medium text-primary"
                    )}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    onClick={() => setSelectedPageId(page.id)}
                >
                    <div
                        className="p-0.5 rounded-sm hover:bg-muted-foreground/10 mr-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(page.id);
                        }}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                        ) : (
                            <div className="w-3 h-3" /> // spacer
                        )}
                    </div>

                    <span className="mr-2 text-base leading-none">{page.icon || "📄"}</span>
                    <span className="truncate flex-1">{page.title || "Untitled"}</span>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreatePage(page.id);
                            }}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreatePage(page.id);
                                }}>
                                    <Plus className="mr-2 h-3 w-3" /> Add sub-page
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete this page and all sub-pages?")) {
                                            deletePage(page.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Children (Only if NOT searching) */}
                {!searchQuery && isExpanded && hasChildren && (
                    <div>
                        {children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
            <div className="p-3 border-b space-y-2 sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">Pages</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCreatePage(null)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {searchQuery ? (
                    filteredPages.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-8">No results.</div>
                    ) : (
                        filteredPages.map(page => renderNode(page, 0))
                    )
                ) : (
                    rootPages.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-8">
                            No pages yet.
                        </div>
                    ) : (
                        rootPages.map(page => renderNode(page))
                    )
                )}
            </div>
        </div>
    );
}
