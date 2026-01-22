"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Save,
    Eye,
    MoveVertical,
    Trash2,
    Type,
    List,
    CheckSquare,
    Calendar,
    AlignLeft,
    Paperclip,
    Plus,
    GripVertical,
    Pencil
} from "lucide-react";
import { useFormStore, FormQuestion, Form } from "@/store/use-form-store";
import { cn } from "@/lib/utils";

interface FormBuilderProps {
    initialData?: Form;
}

export function FormBuilder({ initialData }: FormBuilderProps) {
    const router = useRouter();
    const { addForm, updateForm } = useFormStore();

    // Form State
    const [formTitle, setFormTitle] = useState(initialData?.title || "Untitled Form");
    const [formDescription, setFormDescription] = useState(initialData?.description || "");
    const [questions, setQuestions] = useState<FormQuestion[]>(initialData?.questions || []);

    // UI State
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const addQuestion = (type: string) => {
        const newQuestion: FormQuestion = {
            id: crypto.randomUUID(),
            type,
            title: `New ${type} question`,
            required: false,
            options: type.includes('Select') ? ['Option 1', 'Option 2'] : undefined
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleUpdateQuestion = (id: string, updates: Partial<FormQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSave = () => {
        setIsSaving(true);

        if (initialData) {
            updateForm(initialData.id, {
                title: formTitle,
                description: formDescription,
                questions,
            });
        } else {
            const newForm = {
                id: crypto.randomUUID(),
                title: formTitle,
                description: formDescription,
                questions,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'Draft' as const,
                responses: 0
            };
            addForm(newForm);
        }

        // Simulate network delay for UX
        setTimeout(() => {
            setIsSaving(false);
            router.back(); // Return to list
        }, 800);
    };

    return (
        <div className="flex flex-col h-screen bg-muted/5">
            {/* Header */}
            <div className="h-14 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-10 transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                            <List className="h-4 w-4" />
                        </div>
                        {isPreview ? (
                            <span className="font-semibold text-lg">{formTitle}</span>
                        ) : (
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="border-none shadow-none focus-visible:ring-0 font-semibold text-lg h-auto p-0 rounded-none w-64 bg-transparent hover:bg-muted/50 transition-colors"
                            />
                        )}
                        <Badge variant="outline" className="text-xs font-normal">
                            {initialData ? initialData.status : 'Draft'}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("gap-2", isPreview && "bg-blue-50 text-blue-700 border-blue-200")}
                        onClick={() => setIsPreview(!isPreview)}
                    >
                        {isPreview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {isPreview ? "Edit" : "Preview"}
                    </Button>
                    {!isPreview && (
                        <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Form"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex relative">
                {/* Form Canvas (Center) */}
                <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
                    <div className="max-w-3xl mx-auto space-y-4 pb-20">
                        {/* Title Card */}
                        <div className="bg-white border rounded-lg p-8 shadow-sm mb-6 border-t-8 border-t-purple-600">
                            {isPreview ? (
                                <h1 className="text-3xl font-bold mb-2">{formTitle}</h1>
                            ) : (
                                <Input
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="text-3xl font-bold mb-2 border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent hover:bg-muted/50 transition-colors"
                                    placeholder="Untitled Form"
                                />
                            )}
                            {isPreview ? (
                                <p className="text-muted-foreground">{formDescription || "No description provided."}</p>
                            ) : (
                                <Input
                                    placeholder="Form description"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="border-none shadow-none focus-visible:ring-0 text-muted-foreground p-0 h-auto text-base"
                                />
                            )}
                        </div>

                        {questions.length === 0 && !isPreview ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/20">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-muted-foreground mb-1">Start building your form</h3>
                                <p className="text-sm text-muted-foreground">Select an element from the toolbox to add it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className={cn(
                                            "bg-white border rounded-lg shadow-sm group relative transition-all",
                                            !isPreview && "hover:border-blue-400"
                                        )}
                                    >
                                        {!isPreview && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-move">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                        )}

                                        <div className={cn("p-6", !isPreview && "pl-10")}>
                                            <div className="mb-4">
                                                {isPreview ? (
                                                    <label className="font-medium text-lg block mb-1">
                                                        {q.title}
                                                        {q.required && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                ) : (
                                                    <Input
                                                        value={q.title}
                                                        onChange={(e) => handleUpdateQuestion(q.id, { title: e.target.value })}
                                                        className="border-transparent hover:border-input focus:border-ring font-medium text-lg px-2 -ml-2"
                                                    />
                                                )}
                                            </div>

                                            {/* Preview/Input Area */}
                                            <div className={cn("", isPreview ? "" : "pointer-events-none opacity-60")}>
                                                {q.type === 'Short Text' && <Input placeholder="Short answer text" />}
                                                {q.type === 'Paragraph' && <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-24 resize-none" placeholder="Long answer text" />}
                                                {q.type === 'Single Select' && (
                                                    <div className="space-y-2">
                                                        {q.options?.map((opt, i) => (
                                                            <div key={i} className="flex gap-2 items-center">
                                                                <div className="w-4 h-4 rounded-full border cursor-pointer" />
                                                                <span>{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {q.type === 'Multi Select' && (
                                                    <div className="space-y-2">
                                                        {q.options?.map((opt, i) => (
                                                            <div key={i} className="flex gap-2 items-center">
                                                                <div className="w-4 h-4 rounded border cursor-pointer" />
                                                                <span>{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {q.type === 'Date' && <div className="w-full h-10 border rounded-md flex items-center px-3 text-muted-foreground cursor-pointer hover:bg-muted/5"><Calendar className="mr-2 h-4 w-4" /> Pick a date</div>}
                                                {q.type === 'Attachment' && (
                                                    <div className="w-full h-12 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/10">
                                                        <Paperclip className="h-4 w-4 mr-2" />
                                                        Drag files here or click to upload
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Footer - Edit Mode Only */}
                                        {!isPreview && (
                                            <div className="border-t bg-muted/5 px-4 py-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2 mr-4 border-r pr-4">
                                                    <span className="text-xs text-muted-foreground">Required</span>
                                                    <div
                                                        className={cn("w-8 h-4 rounded-full relative cursor-pointer transition-colors", q.required ? "bg-blue-500" : "bg-muted")}
                                                        onClick={() => handleUpdateQuestion(q.id, { required: !q.required })}
                                                    >
                                                        <div className={cn("w-4 h-4 bg-white rounded-full border shadow-sm absolute top-0 transition-transform", q.required ? "left-4" : "left-0")} />
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteQuestion(q.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoveVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isPreview && (
                            <div className="flex justify-end pt-4">
                                <Button className="w-32">Submit</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbox (Right Sidebar) - Edit Mode Only */}
                {!isPreview && (
                    <div className="w-72 bg-white border-l shadow-sm flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b font-medium text-sm">Form Elements</div>
                        <div className="p-4 space-y-2 overflow-y-auto flex-1">
                            <ToolboxItem icon={<Type className="h-4 w-4 text-blue-500" />} label="Short Text" onClick={() => addQuestion('Short Text')} />
                            <ToolboxItem icon={<AlignLeft className="h-4 w-4 text-blue-500" />} label="Paragraph" onClick={() => addQuestion('Paragraph')} />
                            <ToolboxItem icon={<CheckSquare className="h-4 w-4 text-purple-500" />} label="Single Select" onClick={() => addQuestion('Single Select')} />
                            <ToolboxItem icon={<List className="h-4 w-4 text-purple-500" />} label="Multi Select" onClick={() => addQuestion('Multi Select')} />
                            <ToolboxItem icon={<Calendar className="h-4 w-4 text-orange-500" />} label="Date" onClick={() => addQuestion('Date')} />
                            <ToolboxItem icon={<Paperclip className="h-4 w-4 text-gray-500" />} label="Attachment" onClick={() => addQuestion('Attachment')} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolboxItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-md border bg-white hover:border-blue-400 hover:shadow-sm hover:translate-x-1 transition-all text-left"
        >
            <div className="p-1.5 bg-muted/20 rounded">
                {icon}
            </div>
            <span className="text-sm font-medium text-muted-foreground hover:text-foreground">{label}</span>
            <Plus className="h-3 w-3 ml-auto opacity-0 hover:opacity-100 text-blue-500" />
        </button>
    );
}
