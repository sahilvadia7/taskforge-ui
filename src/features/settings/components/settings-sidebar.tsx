"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    User,
    Settings,
    Palette,
    Monitor,
    LayoutGrid,
    FolderKanban,
    AlertCircle,
    AppWindow,
    CreditCard
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useTenantStore } from "@/store/use-tenant-store";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon: React.ReactNode;
    }[];
}

export function SettingsSidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();

    const { currentTenant } = useTenantStore();
    const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(currentTenant?.role?.toUpperCase() || "");

    const items = [
        {
            href: "/settings/profile",
            title: "Profile",
            icon: <User className="mr-2 h-4 w-4" />,
        },
        {
            href: "/settings/account",
            title: "Account",
            icon: <CreditCard className="mr-2 h-4 w-4" />,
        },
        {
            href: "/settings/appearance",
            title: "Appearance",
            icon: <Palette className="mr-2 h-4 w-4" />,
        },
    ];

    if (isOwnerOrAdmin) {
        items.push({
            href: "/settings/workspace",
            title: "Workspace",
            icon: <FolderKanban className="mr-2 h-4 w-4" />,
        });
    }

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        pathname === item.href
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                    )}
                >
                    {item.icon}
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
