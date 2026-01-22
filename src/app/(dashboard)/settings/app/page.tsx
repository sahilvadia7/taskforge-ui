"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsAppPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">App</h3>
                <p className="text-sm text-muted-foreground">
                    General application settings.
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                App settings content will go here.
            </div>
        </div>
    );
}
