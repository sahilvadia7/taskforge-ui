"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Layout,
    Kanban,
    Users,
    Zap,
    ShieldCheck,
    ArrowRight,
    FlaskConical,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTenantStore } from "@/store/use-tenant-store";
import { useState } from "react";

export function LandingPage() {
    const router = useRouter();
    const { setTenant } = useTenantStore();
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const handleDemoLogin = async () => {
        signIn("keycloak", { callbackUrl: "/onboarding" });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-indigo-500/30">
            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-100 dark:border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            TF
                        </div>
                        <span className="font-bold text-xl tracking-tight">TaskForge</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                            Log in
                        </Button>
                        <Button onClick={() => router.push("/auth/login")}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 pt-32 pb-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New: Kanban Board Automation
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
                        Manage projects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">superhuman</span> efficiency.
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        TaskForge gives your team the power to build better software, faster.
                        Issue tracking, agile planning, and workflows that adapt to you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-1000">
                        <Button size="lg" className="h-12 px-8 text-lg" onClick={() => router.push("/auth/login")}>
                            Start for free <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2" onClick={handleDemoLogin} disabled={isDemoLoading}>
                            {isDemoLoading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <FlaskConical className="h-4 w-4" />
                                    Live Demo Environment
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Preview Image */}
                    <div className="mt-20 relative max-w-5xl mx-auto rounded-xl border bg-gray-50/50 p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                        <div className="rounded-lg overflow-hidden bg-white aspect-video relative">
                            {/* Placeholder for actual screenshot */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
                                <Kanban className="h-24 w-24 opacity-20" />
                                <span className="sr-only">Dashboard Preview</span>
                            </div>
                            {/* We can overlay a generated image here if we had one, but CSS/SVG placeholder fits the "UI" requirement for now */}
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="container mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 transition-colors">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                <Kanban className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Powerful Boards</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Visualize work with flexible Kanban boards. Configure columns, set WIP limits, and automate transitions.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 transition-colors">
                            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Automated Workflows</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Save time with built-in automation. Auto-assign issues, update statuses, and notify your team.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 transition-colors">
                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 mb-4">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Bank-grade security with role-based access control, tenant isolation, and audit logs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust/Social Proof */}
                <div className="border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by innovative teams</h2>
                        <div className="flex flex-wrap justify-center gap-12 text-gray-400 grayscale opacity-70">
                            <div className="flex items-center gap-2 font-bold text-xl"><Layout className="h-6 w-6" /> Acme Corp</div>
                            <div className="flex items-center gap-2 font-bold text-xl"><Users className="h-6 w-6" /> TeamSync</div>
                            <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> FastDev</div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 border-t border-gray-100 dark:border-white/10">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    © 2024 TaskForge. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
