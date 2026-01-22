"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Product</h3>
                <p className="text-sm text-muted-foreground">
                    Configure your product settings (e.g., plans, features).
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                Product settings content will go here.
            </div>
        </div>
    );
}
