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
import { Settings, ArrowRight, Ban } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Define the shape of our rules configuration
export interface TransitionRule {
    from: string;
    to: string;
    allowed: boolean;
}

interface BoardRulesConfigProps {
    statuses: string[];
    rules: TransitionRule[];
    onSaveRules: (newRules: TransitionRule[]) => void;
}

export function BoardRulesConfig({ statuses, rules, onSaveRules }: BoardRulesConfigProps) {
    const [open, setOpen] = useState(false);
    const [localRules, setLocalRules] = useState<TransitionRule[]>(rules);

    // Initialize missing combinations if any
    const getIsAllowed = (from: string, to: string) => {
        const rule = localRules.find(r => r.from === from && r.to === to);
        return rule ? rule.allowed : true; // Default to allowed
    };

    const toggleRule = (from: string, to: string) => {
        setLocalRules(prev => {
            const existing = prev.find(r => r.from === from && r.to === to);
            if (existing) {
                return prev.map(r => r.from === from && r.to === to ? { ...r, allowed: !r.allowed } : r);
            } else {
                return [...prev, { from, to, allowed: false }]; // Toggle from default true to false
            }
        });
    };

    const handleSave = () => {
        onSaveRules(localRules);
        toast.success("Board workflow rules updated");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                    <Settings className="h-4 w-4 mr-2" />
                    Board Rules
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Workflow Configuration</DialogTitle>
                    <DialogDescription>
                        Define allowed status transitions for this board. Uncheck a box to block moving issues between those statuses.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {statuses.map(from => (
                            <div key={from} className="border rounded-lg p-4 bg-muted/20">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    <Badge variant="outline" className="mr-2">FROM</Badge>
                                    {from}
                                </h4>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {statuses.filter(to => to !== from).map(to => {
                                        const allowed = getIsAllowed(from, to);
                                        return (
                                            <div
                                                key={`${from}-${to}`}
                                                className={`
                                                    flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors
                                                    ${allowed ? "bg-card hover:border-primary/50" : "bg-destructive/10 border-destructive/30"}
                                                `}
                                                onClick={() => toggleRule(from, to)}
                                            >
                                                <div className={`h-4 w-4 rounded border flex items-center justify-center ${allowed ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                                                    {allowed && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    {!allowed && <Ban className="h-3 w-3 text-destructive" />}
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <span className="font-medium mr-1.5 opacity-70">To</span>
                                                    <span className={allowed ? "font-semibold" : "font-medium text-muted-foreground line-through"}>
                                                        {to}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Rules</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
