import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { IssueDetailModal } from "@/features/issues/components/issue-detail-modal";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
                    {children}
                </main>
            </div>
            <IssueDetailModal />
        </div>
    );
}

