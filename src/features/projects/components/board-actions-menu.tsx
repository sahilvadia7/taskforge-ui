import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Settings, GitGraph, LayoutTemplate } from "lucide-react";

interface BoardActionsMenuProps {
    onOpenWorkflow: () => void;
    onOpenSettings: () => void;
}

export function BoardActionsMenu({ onOpenWorkflow, onOpenSettings }: BoardActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpenWorkflow}>
                    <GitGraph className="mr-2 h-4 w-4" />
                    <span>Manage workflow</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configure board</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
