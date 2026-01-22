"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, LogIn, UserPlus, KeyRound, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleLogin = async () => {
        setIsLoading("login");
        try {
            await signIn("keycloak", { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleRegister = async () => {
        setIsLoading("register");
        try {
            await signIn("keycloak", {
                callbackUrl: "/dashboard"
            }, {
                kc_action: "register"
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleSwitchAccount = async () => {
        setIsLoading("switch");
        try {
            // "prompt: login" forces Keycloak to show the login screen again
            await signIn("keycloak", {
                callbackUrl: "/dashboard"
            }, {
                prompt: "login"
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <Card className="w-full max-w-md relative z-10 shadow-xl border-zinc-200 dark:border-zinc-800">
            <CardHeader className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome to TaskForge</CardTitle>
                <CardDescription>
                    Secure, enterprise-grade project management.
                    <br />
                    Please sign in to continue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Authentication Error</AlertTitle>
                        <AlertDescription>
                            {error === "AccessDenied" ? "Access denied. You do not have permission." : "An error occurred during sign in."}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4">
                    <Button
                        className="w-full h-11 text-base"
                        size="lg"
                        onClick={handleLogin}
                        disabled={!!isLoading}
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        {isLoading === "login" ? "Redirecting..." : "Sign In with SSO"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                New to TaskForge?
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleRegister} // Note: Usually goes to same Keycloak login page where 'Register' link exists
                        disabled={!!isLoading}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={handleSwitchAccount}
                        disabled={!!isLoading}
                    >
                        {isLoading === "switch" ? "Redirecting..." : "Switch Account"}
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>Forgot your password?</span>
                </div>
                <p className="text-xs max-w-[280px] mx-auto mt-2">
                    Use the "Forgot Password" link on the secure login page to reset your credentials.
                </p>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary relative z-20" />}>
                <LoginContent />
            </Suspense>
        </div>
    );
}
