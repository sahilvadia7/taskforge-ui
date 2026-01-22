import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
    };

    return (
        <div role="status" className="flex items-center justify-center">
            <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function PageSpinner() {
    return (
        <div className="flex h-full w-full items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
        </div>
    );
}
