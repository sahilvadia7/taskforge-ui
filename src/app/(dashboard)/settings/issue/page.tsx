"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsIssuePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Issue</h3>
                <p className="text-sm text-muted-foreground">
                    Configure issue types, workflows, and fields.
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                Issue settings content will go here.
            </div>
        </div>
    );
}
