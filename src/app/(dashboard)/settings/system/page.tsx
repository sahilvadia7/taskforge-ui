"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsSystemPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">System</h3>
                <p className="text-sm text-muted-foreground">
                    Manage system-wide settings and configurations.
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                System settings content will go here.
            </div>
        </div>
    );
}
