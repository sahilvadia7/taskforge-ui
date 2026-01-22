import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";

export interface ViewSettingsState {
    showKey: boolean;
    showType: boolean;
    showPriority: boolean;
    showAssignee: boolean;
    showStatus: boolean;
}

interface BoardViewSettingsProps {
    settings: ViewSettingsState;
    onChange: (newSettings: ViewSettingsState) => void;
}

export function BoardViewSettings({ settings, onChange }: BoardViewSettingsProps) {
    const toggle = (key: keyof ViewSettingsState) => {
        onChange({ ...settings, [key]: !settings[key] });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>View settings</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Card Fields</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={settings.showKey}
                    onCheckedChange={() => toggle("showKey")}
                >
                    Issue Key
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={settings.showType}
                    onCheckedChange={() => toggle("showType")}
                >
                    Issue Type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={settings.showPriority}
                    onCheckedChange={() => toggle("showPriority")}
                >
                    Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={settings.showAssignee}
                    onCheckedChange={() => toggle("showAssignee")}
                >
                    Assignee
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={settings.showStatus}
                    onCheckedChange={() => toggle("showStatus")}
                >
                    Status
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
