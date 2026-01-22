"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
// Removed Input
import { Settings, Plus, X, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ALL_ISSUE_STATUSES } from "../../issues/types";

interface BoardSettingsModalProps {
    currentStatuses: string[];
    onSave: (newStatuses: string[]) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BoardSettingsModal({ currentStatuses, onSave, isOpen, onOpenChange }: BoardSettingsModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [statuses, setStatuses] = useState<string[]>(currentStatuses);
    // const [newStatus, setNewStatus] = useState(""); // No longer needed for input

    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setStatuses(currentStatuses); // Reset to props on open
        }
        setOpen?.(newOpen);
    };

    // Filter out statuses that are already added
    const availableStatuses = ALL_ISSUE_STATUSES.filter(s => !statuses.includes(s));

    const addStatus = (status: string) => {
        setStatuses([...statuses, status]);
    };

    const removeStatus = (index: number) => {
        const newTags = [...statuses];
        newTags.splice(index, 1);
        setStatuses(newTags);
    };

    const moveStatus = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === statuses.length - 1) return;

        const newTags = [...statuses];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newTags[index];
        newTags[index] = newTags[targetIndex];
        newTags[targetIndex] = temp;
        setStatuses(newTags);
    };

    const handleSave = () => {
        if (statuses.length === 0) {
            toast.error("Board must have at least one column");
            return;
        }
        onSave(statuses);
        toast.success("Board columns updated");
        setOpen?.(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Board Columns
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Board Columns</DialogTitle>
                    <DialogDescription>
                        Add, remove, or reorder the columns for this project board.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Add Column</Label>
                        <Select onValueChange={addStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status to add..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                                {availableStatuses.length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        All statuses added
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border rounded-md p-2 bg-muted/20 max-h-[300px] overflow-y-auto">
                        {statuses.map((status, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-0.5 text-muted-foreground">
                                        <button
                                            onClick={() => moveStatus(index, 'up')}
                                            disabled={index === 0}
                                            className="hover:text-foreground disabled:opacity-30"
                                        >
                                            <MoveUp className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => moveStatus(index, 'down')}
                                            disabled={index === statuses.length - 1}
                                            className="hover:text-foreground disabled:opacity-30"
                                        >
                                            <MoveDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <Badge variant="outline" className="text-sm font-medium">
                                        {status}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeStatus(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {statuses.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">No columns defined.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen?.(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Columns</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
