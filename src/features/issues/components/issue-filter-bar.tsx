import { Button } from "@/components/ui/button";
import { IssueType } from "../types";
import { Bug, CheckSquare, Bookmark, LayoutList, Filter, MoreHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface IssueFilterBarProps {
    selectedTypes: IssueType[];
    onTypeChange: (types: IssueType[]) => void;
}

export function IssueFilterBar({ selectedTypes, onTypeChange }: IssueFilterBarProps) {
    const toggleType = (type: IssueType) => {
        if (selectedTypes.includes(type)) {
            onTypeChange(selectedTypes.filter(t => t !== type));
        } else {
            onTypeChange([...selectedTypes, type]);
        }
    };

    const clearFilters = () => {
        onTypeChange([]);
    };

    const activeCount = selectedTypes.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <Filter className="h-4 w-4" />
                    Type
                    {activeCount > 0 && (
                        <>
                            <span className="h-4 w-[1px] bg-border" />
                            <div className="flex gap-1">
                                {activeCount > 2 ? (
                                    <span className="bg-primary/10 text-primary rounded px-1 text-[10px] font-medium">
                                        {activeCount} selected
                                    </span>
                                ) : (
                                    selectedTypes.map(type => (
                                        <span key={type} className="bg-primary/10 text-primary rounded px-1 text-[10px] font-medium capitalize">
                                            {type.toLowerCase()}
                                        </span>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={selectedTypes.includes("STORY")}
                    onCheckedChange={() => toggleType("STORY")}
                >
                    <Bookmark className="mr-2 h-4 w-4 text-green-600" />
                    Story
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={selectedTypes.includes("TASK")}
                    onCheckedChange={() => toggleType("TASK")}
                >
                    <CheckSquare className="mr-2 h-4 w-4 text-blue-600" />
                    Task
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={selectedTypes.includes("BUG")}
                    onCheckedChange={() => toggleType("BUG")}
                >
                    <Bug className="mr-2 h-4 w-4 text-red-600" />
                    Bug
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={selectedTypes.includes("EPIC")}
                    onCheckedChange={() => toggleType("EPIC")}
                >
                    <LayoutList className="mr-2 h-4 w-4 text-purple-600" />
                    Epic
                </DropdownMenuCheckboxItem>
                {selectedTypes.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={clearFilters}
                            className="justify-center text-center text-sm font-medium"
                        >
                            Clear filters
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
