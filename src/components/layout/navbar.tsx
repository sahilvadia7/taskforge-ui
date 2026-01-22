"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    Settings,
    Bell,
    Plus,
    User,
    Monitor,
    LogOut
} from "lucide-react";
import { CreateIssueModal } from "@/features/issues/components/create-issue-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useTenantStore } from "@/store/use-tenant-store";
import { useIssueStore } from "@/store/use-issue-store";
import { NotificationPopover } from "./notification-popover";
import { SearchCommand } from "@/features/search/components/search-command";

export function Navbar() {
    const { data: session } = useSession();
    const { openCreateIssue, openCreateProject } = useModalStore();
    const { currentTenant } = useTenantStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Keyboard shortcut: Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLogout = async () => {
        // Clear global state
        useTenantStore.getState().clearTenant();

        // Get ID token for seamless logout (avoids confirmation screen)
        // @ts-ignore - session type extension
        const idToken = session?.id_token;

        // 1. Sign out from NextAuth (clears local session)
        await signOut({ redirect: false });

        // 2. Redirect to Keycloak Logout
        // The post_logout_redirect_uri must match one of the Valid Redirect URIs in Keycloak
        const keycloakLogoutUrl = "http://localhost:10091/realms/taskforge/protocol/openid-connect/logout";
        const postLogoutRedirectUri = `${window.location.origin}/`;

        const params = new URLSearchParams();
        params.append("post_logout_redirect_uri", postLogoutRedirectUri);
        if (idToken) {
            params.append("id_token_hint", idToken);
        }

        window.location.href = `${keycloakLogoutUrl}?${params.toString()}`;
    };

    return (
        <>
            <header className="flex h-14 items-center justify-between border-b px-4 bg-background sticky top-0 z-10 w-full">
                {/* Left: Search & Create */}
                <div className="flex items-center gap-4 flex-1">
                    <h1 className="text-sm font-semibold hidden md:block mr-2 text-foreground">
                        {currentTenant ? currentTenant.name : "TaskForge"}
                    </h1>

                    <div
                        className="relative w-full max-w-md hidden md:block cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <div className="w-full pl-9 h-9 bg-muted/50 border border-transparent rounded-md flex items-center text-muted-foreground text-sm hover:bg-muted transition-colors">
                            Search...
                            <kbd className="ml-auto mr-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Create
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openCreateIssue()} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Issue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={openCreateProject} className="cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right: Actions & Profile */}
                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-2">
                    <NotificationPopover />



                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2 ring-1 ring-border/20">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                            {session.user?.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1 p-2 bg-muted/30 rounded-t-sm -mx-1 -mt-1 mb-2">
                                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/onboarding" className="flex items-center cursor-pointer">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Switch Organization
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="flex items-center cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/account" className="flex items-center cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Account settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/appearance" className="flex items-center cursor-pointer">
                                        <Monitor className="mr-2 h-4 w-4" />
                                        Theme
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => signIn()} size="sm" variant="outline" className="ml-2">
                            Sign in
                        </Button>
                    )}
                </div>
            </header>
            <CreateIssueModal />
            <CreateProjectModal />
            <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </>
    );
}


