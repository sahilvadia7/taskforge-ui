"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Folder, AlertCircle, Settings, ChevronsUpDown, Plus, Building2, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalStore } from "@/store/use-modal-store";
import { CreateTenantModal } from "@/features/tenants/components/create-tenant-modal";
import { useTenants } from "@/features/tenants/hooks/use-tenants";
import { useTenantStore } from "@/store/use-tenant-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/store/use-sidebar-store";

export function Sidebar() {
    const pathname = usePathname();
    const { data: tenants, isLoading } = useTenants();
    const { currentTenant, setTenant } = useTenantStore();
    const { openCreateTenant } = useModalStore();
    const { isOpen, toggle } = useSidebarStore();

    // Auto-select first tenant if none selected AND sync stale data (like missing role)
    useEffect(() => {
        if (tenants && tenants.length > 0) {
            if (!currentTenant) {
                setTenant(tenants[0]);
            } else {
                // Refresh current tenant data if it exists in the list
                const fresh = tenants.find(t => t.id === currentTenant.id);
                if (fresh) {
                    // Update if role is missing or changed (critical for permissions)
                    if (fresh.role !== currentTenant.role || fresh.name !== currentTenant.name) {
                        setTenant(fresh);
                    }
                }
            }
        }
    }, [currentTenant, tenants, setTenant]);

    const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(currentTenant?.role?.toUpperCase() || "");

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Projects", icon: Folder },
        { href: "/issues", label: "Issues", icon: AlertCircle },
    ];

    if (isOwnerOrAdmin) {
        links.push({ href: "/settings", label: "Settings", icon: Settings });
    }

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch for Radix UI components
    if (!mounted) {
        return (
            <div className="flex h-full w-64 flex-col border-r bg-background">
                <div className="flex h-16 items-center border-b px-4">
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex-1 px-3 py-4">
                    {links.map((link, i) => (
                        <Skeleton key={i} className="h-9 w-full mb-1" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out relative group",
                isOpen ? "w-64" : "w-16"
            )}
        >
            {/* Collapse Toggle - Absolute positioned on border or just inside */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted hidden group-hover:flex",
                    !isOpen && "flex" // Always show when closed
                )}
                onClick={toggle}
            >
                <ChevronsUpDown className="h-3 w-3 rotate-90" />
            </Button>

            <div className={cn("flex h-16 items-center border-b", isOpen ? "px-4" : "justify-center px-2")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn("w-full justify-between px-2", !isOpen && "justify-center px-0")}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10">
                                    <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                {isOpen && (
                                    <>
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-24" />
                                        ) : (
                                            <span className="truncate font-semibold">
                                                {currentTenant?.name || "Select Workspace"}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {isOpen && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
                        </Button>
                    </DropdownMenuTrigger>
                    {/* Only show full dropdown content? Or maybe allow switching even in mini mode?
                        If mini, aligning 'start' might look weird if the trigger is small. 
                        Let's force align="start" with an offset if possible, or just standard behavior.
                    */}
                    <DropdownMenuContent align="start" className="w-56" sideOffset={isOpen ? 0 : 10} side={isOpen ? "bottom" : "right"}>
                        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                        {tenants?.map((tenant) => (
                            <DropdownMenuItem
                                key={tenant.id}
                                onClick={() => setTenant(tenant)}
                                className={cn(
                                    "cursor-pointer",
                                    currentTenant?.id === tenant.id && "bg-accent"
                                )}
                            >
                                <span className="truncate">{tenant.name}</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={openCreateTenant}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Workspace</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <CreateTenantModal />
            </div>

            <div className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href) || (link.href === "/dashboard" && pathname === "/");
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size={isOpen ? "default" : "icon"}
                                    className={cn(
                                        "w-full mb-1",
                                        isOpen ? "justify-start" : "justify-center",
                                        isActive && "font-medium"
                                    )}
                                    title={!isOpen ? link.label : undefined}
                                >
                                    <Icon className={cn("h-4 w-4", isOpen && "mr-2")} />
                                    {isOpen && <span>{link.label}</span>}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Exit Demo / User Footer */}
            <div className={cn("border-t", isOpen ? "p-4" : "p-2 py-4 flex justify-center")}>
                <div className={cn("flex items-center gap-3", isOpen ? "px-2" : "justify-center")}>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    {isOpen && (
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
