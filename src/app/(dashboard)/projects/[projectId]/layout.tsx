"use client";

import { use } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, List, Kanban, CalendarRange, ListTodo, FileText, ClipboardList, Code, GanttChartSquare, Layers } from "lucide-react";
import { useProject } from "@/features/projects/hooks/useProjects";

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { projectId } = use(params);
    const { data: project } = useProject(projectId);

    // Determine current active tab based on URL
    const getActiveTab = () => {
        if (pathname.includes("/list")) return "list";
        if (pathname.includes("/board")) return "board";
        if (pathname.includes("/backlog")) return "backlog";
        if (pathname.includes("/timeline")) return "timeline";
        if (pathname.includes("/issues")) return "issues";
        if (pathname.includes("/settings")) return "settings";
        if (pathname.includes("/forms")) return "forms";
        if (pathname.includes("/pages")) return "pages";
        if (pathname.includes("/summary")) return "summary";
        if (pathname.includes("/epics")) return "epics";
        if (pathname.includes("/development")) return "development";
        return "summary"; // Default
    };

    const activeTab = getActiveTab();

    const handleTabChange = (value: string) => {
        router.push(`/projects/${projectId}/${value}`);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b px-6 py-4 bg-background flex items-center gap-4">
                <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold leading-none tracking-tight">
                        {project?.name || "Loading..."}
                    </h1>
                    <div className="text-xs text-muted-foreground mt-1">
                        {project?.key || "PROJECT"} / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </div>
                </div>
            </div>

            <div className="border-b px-6 bg-background">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-transparent p-0 h-12 w-full justify-start gap-6 border-b-0 rounded-none overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {[
                            { value: "summary", label: "Summary", icon: LayoutDashboard },
                            { value: "epics", label: "Epics", icon: Layers },
                            { value: "backlog", label: "Backlog", icon: ListTodo },
                            { value: "list", label: "List", icon: List },
                            { value: "board", label: "Board", icon: Kanban },
                            { value: "calendar", label: "Calendar", icon: CalendarRange },
                            { value: "timeline", label: "Timeline", icon: GanttChartSquare },
                            { value: "pages", label: "Pages", icon: FileText },
                            { value: "forms", label: "Forms", icon: ClipboardList },
                            { value: "development", label: "Development", icon: Code },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 pb-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors hover:text-foreground border-0 bg-transparent"
                            >
                                <tab.icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div >

            <div className="flex-1 overflow-auto p-6 bg-muted/10">
                {children}
            </div>
        </div>
    );
}
