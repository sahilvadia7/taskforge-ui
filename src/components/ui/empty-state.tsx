import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50", className)}>
            {Icon && (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
