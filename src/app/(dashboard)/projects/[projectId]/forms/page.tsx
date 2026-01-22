"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    FileSpreadsheet,
    Plus,
    Search,
    MoreHorizontal,
    Star,
    Clock,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Pencil,
    Trash2
} from "lucide-react";
import { useFormStore, Form } from "@/store/use-form-store";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FormsPage() {
    const router = useRouter();
    const { forms, deleteForm } = useFormStore();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sort forms by createdAt desc
    const sortedForms = [...forms].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleEdit = (id: string) => {
        router.push(`forms/${id}`);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (confirm("Are you sure you want to delete this form?")) {
            deleteForm(id);
        }
    };

    if (!isMounted) {
        return null; // Or return a skeleton loader
    }

    return (
        <div className="flex h-full border rounded-lg bg-background overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b">
                    <Button className="w-full justify-start gap-2" size="sm" onClick={() => router.push("forms/new")}>
                        <Plus className="h-4 w-4" />
                        Create Form
                    </Button>
                </div>

                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search forms..." className="pl-8 h-8 text-xs" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Views</div>
                    <NavItem icon={<FileSpreadsheet className="h-4 w-4" />} label="All Forms" active />
                    <NavItem icon={<Star className="h-4 w-4" />} label="Starred" />
                    <NavItem icon={<Clock className="h-4 w-4" />} label="Recent" />
                    <NavItem icon={<Filter className="h-4 w-4" />} label="Drafts" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="h-12 border-b flex items-center justify-between px-6">
                    <div className="flex items-center text-sm text-foreground font-medium">
                        All Forms
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 border rounded p-0.5 mr-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 bg-muted/50">
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {sortedForms.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                <FileSpreadsheet className="h-8 w-8 opacity-50" />
                            </div>
                            <h3 className="font-semibold mb-1">No forms yet</h3>
                            <p className="text-sm mb-4">Create your first form to get started</p>
                            <Button size="sm" onClick={() => router.push("forms/new")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Form
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedForms.map((form) => (
                                <FormCard
                                    key={form.id}
                                    form={form}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md mx-2 ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

interface FormCardProps {
    form: Form;
    onEdit: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

function FormCard({ form, onEdit, onDelete }: FormCardProps) {
    return (
        <div
            onClick={() => onEdit(form.id)}
            className="group border rounded-lg p-4 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all bg-card"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                    <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(form.id)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => onDelete(form.id, e)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <h3 className="font-semibold text-sm mb-1 truncate">{form.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">Last updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}</p>

            <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{form.responses}</span> responses
                </div>
                <Badge variant={form.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                    {form.status}
                </Badge>
            </div>
        </div>
    );
}
