"use client";

import { TenantSettings } from "@/features/tenants/components/tenant-settings";
import { Separator } from "@/components/ui/separator";

export default function WorkspaceSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Workspace</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your workspace preferences.
                </p>
            </div>
            <Separator />
            <TenantSettings />
        </div>
    );
}
