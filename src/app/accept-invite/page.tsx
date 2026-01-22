"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvitation, getInvitationDetails, InvitationDetailsResponse } from "@/features/tenants/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<"loading" | "preview" | "accepting" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [invitation, setInvitation] = useState<InvitationDetailsResponse | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("No invitation token provided.");
            return;
        }

        // Fetch details first
        const fetchDetails = async () => {
            try {
                const details = await getInvitationDetails(token);
                setInvitation(details);
                setStatus("preview");
            } catch (error: any) {
                console.error("Failed to load invitation", error);
                setStatus("error");
                setErrorMessage(error.response?.data?.message || "Invalid or expired invitation link.");
            }
        };

        fetchDetails();
    }, [token]);

    const handleAccept = async () => {
        if (!token) return;
        setStatus("accepting");
        try {
            await acceptInvitation(token);
            await queryClient.invalidateQueries({ queryKey: ["tenants"] });
            setStatus("success");
            toast.success("Invitation accepted successfully!");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (error: any) {
            setStatus("preview"); // Go back to preview on error? Or error state?
            toast.error(error.response?.data?.message || "Failed to accept invitation.");
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-2">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">TaskForge Invite</CardTitle>
                <CardDescription>
                    {status === "loading" && "Validating your invitation..."}
                    {status === "preview" && "You've been invited to join a workspace"}
                    {status === "accepting" && "Joining workspace..."}
                    {status === "success" && "Welcome aboard!"}
                    {status === "error" && "Invitation Error"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-4 gap-6">

                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}

                {status === "preview" && invitation && (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <span className="text-2xl font-bold text-primary">
                                    {(invitation.tenantName || "W").charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold">{invitation.tenantName}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Invited by <span className="font-medium text-foreground">{invitation.inviterName}</span></p>
                                <p>Role: <Badge variant="outline">{invitation.role}</Badge></p>
                            </div>
                        </div>

                        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground text-center">
                            Accepting as <span className="font-medium text-foreground">{invitation.email}</span>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleAccept}>
                            Join Workspace
                        </Button>
                    </div>
                )}

                {status === "accepting" && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Setting up your access...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            Redirecting you to the dashboard...
                        </p>
                        <Button className="w-full" onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                            <XCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
                        </div>
                        <p className="text-center text-sm text-red-600 dark:text-red-400 font-medium">
                            {errorMessage}
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                            Return to Dashboard
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}

export default function AcceptInvitePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
            <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
                <AcceptInviteContent />
            </Suspense>
        </div>
    );
}
