"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsAccountPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">
                    Update your account settings. Set your preferred language and timezone.
                </p>
            </div>
            <Separator />
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" placeholder="English" disabled />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" placeholder="IST - India Standard Time" disabled />
                </div>
                <div className="pt-4">
                    <Button variant="destructive">Delete Account</Button>
                </div>
            </div>
        </div>
    );
}
