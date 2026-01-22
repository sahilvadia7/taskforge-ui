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
import { Settings, Ban, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TransitionConfig, WorkflowRule } from "../logic/rule-engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowEditorProps {
    statuses: string[];
    currentTransitions: TransitionConfig[];
    onSave: (newTransitions: TransitionConfig[]) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function WorkflowEditor({ statuses, currentTransitions, onSave, isOpen, onOpenChange }: WorkflowEditorProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [transitions, setTransitions] = useState<TransitionConfig[]>(currentTransitions);
    const [editingTransition, setEditingTransition] = useState<{ from: string, to: string } | null>(null);

    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    // Helper to get config for a pair
    const getConfig = (from: string, to: string): TransitionConfig => {
        return transitions.find(t => t.from === from && t.to === to) || {
            from,
            to,
            allowed: true, // Default allowed
            rules: []
        };
    };

    const updateConfig = (newConfig: TransitionConfig) => {
        setTransitions(prev => {
            const index = prev.findIndex(t => t.from === newConfig.from && t.to === newConfig.to);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = newConfig;
                return updated;
            } else {
                return [...prev, newConfig];
            }
        });
    };

    const handleSave = () => {
        onSave(transitions);
        toast.success("Workflow configuration saved");
        onSave(transitions);
        toast.success("Workflow configuration saved");
        setOpen?.(false);
    };

    // Sub-modal for editing a specific transition
    const activeConfig = editingTransition ? getConfig(editingTransition.from, editingTransition.to) : null;

    const addRule = (type: WorkflowRule['type']) => {
        if (!activeConfig) return;
        const newRule: WorkflowRule = {
            id: crypto.randomUUID(),
            type,
            value: "",
            message: ""
        };
        updateConfig({
            ...activeConfig,
            rules: [...activeConfig.rules, newRule]
        });
    };

    const removeRule = (ruleId: string) => {
        if (!activeConfig) return;
        updateConfig({
            ...activeConfig,
            rules: activeConfig.rules.filter(r => r.id !== ruleId)
        });
    };

    const updateRuleValue = (ruleId: string, value: string) => {
        if (!activeConfig) return;
        updateConfig({
            ...activeConfig,
            rules: activeConfig.rules.map(r => r.id === ruleId ? { ...r, value } : r)
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Workflow Editor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Workflow & Rule Engine</DialogTitle>
                    <DialogDescription>
                        Configure allowed transitions and enforce rules (e.g. required roles, fields).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {/* Matrix View */}
                    {!editingTransition ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {statuses.map(from => (
                                    <div key={from} className="border rounded-lg p-4 bg-muted/20">
                                        <h4 className="font-semibold mb-3 flex items-center text-sm">
                                            <Badge variant="outline" className="mr-2">FROM</Badge>
                                            {from}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                            {statuses.filter(to => to !== from).map(to => {
                                                const config = getConfig(from, to);
                                                const ruleCount = config.rules?.length || 0;
                                                return (
                                                    <div
                                                        key={`${from}-${to}`}
                                                        className={`
                                                            flex flex-col gap-2 p-3 rounded border cursor-pointer transition-colors relative
                                                            ${config.allowed ? "bg-card hover:border-primary/50" : "bg-destructive/5 border-destructive/20 opacity-80"}
                                                        `}
                                                        onClick={() => setEditingTransition({ from, to })}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${config.allowed ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" : "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"}`}>
                                                                {config.allowed ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                                            </div>
                                                            {ruleCount > 0 && config.allowed && (
                                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                    {ruleCount} Rules
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">To</span>
                                                            <div className="font-semibold text-sm leading-tight">{to}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Detail View for Single Transition
                        <div className="space-y-6">

                            <div className="flex items-center justify-between pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingTransition(null)}>
                                        &larr; Back
                                    </Button>
                                    <h3 className="font-semibold text-lg ml-2">
                                        {activeConfig?.from} <span className="text-muted-foreground mx-2">&rarr;</span> {activeConfig?.to}
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="allow-switch" className="font-medium">Transition Allowed?</Label>
                                        <Switch
                                            id="allow-switch"
                                            checked={activeConfig?.allowed}
                                            onCheckedChange={(checked) => activeConfig && updateConfig({ ...activeConfig, allowed: checked })}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {activeConfig?.allowed ? "Users can move issues (subject to rules)." : "Transition is completely blocked."}
                                    </span>
                                </div>
                            </div>

                            {activeConfig?.allowed ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Validation Rules</h4>
                                        <DropdownMenuRuleAdder onAdd={addRule} />
                                    </div>

                                    <div className="space-y-3">
                                        {activeConfig?.rules.length === 0 && (
                                            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                                                No rules defined. Anyone can perform this transition.
                                            </div>
                                        )}
                                        {activeConfig?.rules.map((rule, idx) => (
                                            <Card key={rule.id}>
                                                <CardContent className="p-4 flex items-start gap-4">
                                                    <div className="mt-1">
                                                        {rule.type === "RESTRICT_ROLE" && <Badge>Role Check</Badge>}
                                                        {rule.type === "REQUIRED_FIELD" && <Badge variant="outline">Field Check</Badge>}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="text-sm font-medium">
                                                            {rule.type === "RESTRICT_ROLE" ? "Requires User Role:" : "Requires Field Value:"}
                                                        </div>

                                                        {rule.type === "RESTRICT_ROLE" ? (
                                                            <Input
                                                                value={rule.value}
                                                                onChange={(e) => updateRuleValue(rule.id, e.target.value)}
                                                                placeholder="e.g. ADMIN, QA"
                                                                className="max-w-md"
                                                            />
                                                        ) : (
                                                            <Select
                                                                value={rule.value}
                                                                onValueChange={(val) => updateRuleValue(rule.id, val)}
                                                            >
                                                                <SelectTrigger className="max-w-md">
                                                                    <SelectValue placeholder="Select field..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="description">Description</SelectItem>
                                                                    <SelectItem value="assigneeId">Assignee</SelectItem>
                                                                    <SelectItem value="priority">Priority</SelectItem>
                                                                    <SelectItem value="dueDate">Due Date</SelectItem>
                                                                    <SelectItem value="labels">Labels</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeRule(rule.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 text-center bg-muted/20 rounded-lg">
                                    <Ban className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-20" />
                                    <p className="text-muted-foreground">This transition is currently disabled.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    {editingTransition ? (
                        <Button onClick={() => setEditingTransition(null)}>Done Editing</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setOpen?.(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Configuration</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DropdownMenuRuleAdder({ onAdd }: { onAdd: (type: WorkflowRule['type']) => void }) {
    return (
        <Select onValueChange={(v) => onAdd(v as any)}>
            <SelectTrigger className="w-[180px]">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="RESTRICT_ROLE">Restrict by Role</SelectItem>
                <SelectItem value="REQUIRED_FIELD">Require Field</SelectItem>
            </SelectContent>
        </Select>
    );
}
