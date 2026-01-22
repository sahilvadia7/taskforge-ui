import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LineChart, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectInsights } from "../hooks/useProjects";
import { useIssues } from "@/features/issues/hooks/use-issues";
import { Skeleton } from "@/components/ui/skeleton";

interface BoardInsightsProps {
    projectId: string;
}

export function BoardInsights({ projectId }: BoardInsightsProps) {
    const { data: insights, isLoading } = useProjectInsights(projectId);
    const { data: issues = [] } = useIssues(projectId);

    // Filter issues on client side for the detailed list view if needed, 
    // or rely on the insights summary.
    // The previous implementation showed specific overdue issues.
    // The new API gives us counts.
    // To show the *list* of overdue issues, we can still use the client-side issues list 
    // effectively since we have it loaded in the board view context anyway?
    // Actually, let's keep using the passed issues OR fetch them if we want to be standalone.
    // The previous component took `issues` as prop.
    // Let's use the `useIssues` hook to get full details for the list, 
    // and `useProjectInsights` for the aggregate stats like "Time in Status".

    const overdueIssues = issues.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== "DONE" && i.status !== "Done" && i.status !== "RESOLVED" && i.status !== "CLOSED");

    // Use the count from API for consistency/speed, or client side list? 
    // API is better for "official" stats, client list for "what can I click".
    // Let's stick to client list for the interaction parts.

    if (isLoading) {
        return (
            <Button variant="outline" size="sm" disabled className="h-9 gap-2">
                <LineChart className="h-3.5 w-3.5" />
                <span>Loading...</span>
            </Button>
        );
    }

    const timeInStatus = insights?.timeInStatus || [];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <LineChart className="h-3.5 w-3.5" />
                    <span>Insights</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none overflow-y-auto">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Board Insights</SheetTitle>
                    <SheetDescription>
                        Stay up to date with your work in progress.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6 px-6 pb-6">
                    {/* Attention Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Work items for attention</h3>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {overdueIssues.length > 0 ? (
                            <div className="space-y-2">
                                {overdueIssues.map(issue => (
                                    <Card key={issue.id} className="bg-red-50 dark:bg-red-900/10 border-red-200">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge variant="outline" className="border-red-200 text-red-700">{issue.status}</Badge>
                                                <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Due {new Date(issue.dueDate!).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="font-medium text-sm">{issue.summary}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{issue.key}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                                No overdue items. Great job!
                            </div>
                        )}

                        {insights?.highPriorityCount !== undefined && insights.highPriorityCount > 0 && overdueIssues.length === 0 && (
                            <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-200">
                                <CardHeader className="p-3 pb-1">
                                    <CardTitle className="text-xs font-medium text-orange-700">High Priority</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="text-2xl font-bold text-orange-800">{insights.highPriorityCount}</div>
                                    <p className="text-xs text-orange-600">Critical items requiring attention</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="border-t pt-6"></div>

                    {/* Time in Status */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Time spent in status (Avg)</h3>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-3">
                            {timeInStatus.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No historical data available yet</p>
                            ) : (
                                timeInStatus.map((item) => (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium uppercase">{item.status}</span>
                                            <span className="text-muted-foreground">{item.avgDays} days</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/80"
                                                style={{ width: `${Math.min((item.avgDays / 7) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
