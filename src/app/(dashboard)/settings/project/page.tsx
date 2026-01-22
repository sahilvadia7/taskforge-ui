"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsProjectPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Project</h3>
                <p className="text-sm text-muted-foreground">
                    Manage default settings for new projects.
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                Project settings content will go here.
            </div>
        </div>
    );
}
