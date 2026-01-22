"use client";

import { useState } from "react";
import { Bell, Check, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, Notification } from "@/features/notifications/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function NotificationPopover() {
    const [open, setOpen] = useState(false);
    const { data: notificationsPage, isLoading } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();

    // Handling page content safely
    const notifications: Notification[] = notificationsPage?.content || [];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute flex h-2 w-2 top-2 right-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h4 className="font-semibold leading-none">Notifications</h4>
                        {unreadCount > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                You have {unreadCount} unread messages
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs"
                            onClick={() => markAllAsRead()}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b h-10 px-4 bg-transparent">
                        <TabsTrigger
                            value="all"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 pt-1.5"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="unread"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 pt-1.5"
                        >
                            Unread
                        </TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[400px]">
                        <TabsContent value="all" className="m-0">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                                    <MailOpen className="h-8 w-8 mb-2 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={() => !notification.read && markAsRead(notification.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="unread" className="m-0">
                            {/* Filter unread logic just for UI, or call separate API. For simplicity filtering client side */}
                            <div className="divide-y">
                                {notifications.filter(n => !n.read).map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onRead={() => markAsRead(notification.id)}
                                    />
                                ))}
                                {notifications.filter(n => !n.read).length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                                        <Check className="h-8 w-8 mb-2 opacity-50" />
                                        <p>All caught up!</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
    return (
        <div
            className={`flex flex-col gap-1 p-4 text-sm transition-colors hover:bg-muted/50 cursor-pointer ${!notification.read ? "bg-muted/20" : ""
                }`}
            onClick={onRead}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-foreground">
                    {notification.type === 'ISSUE_ASSIGNED' ? 'Issue Assigned' :
                        notification.type === 'ISSUE_UPDATED' ? 'Issue Updated' : 'Notification'}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
            </div>
            <p className="text-muted-foreground line-clamp-2">
                {notification.message}
            </p>
            {!notification.read && (
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                        New
                    </Badge>
                </div>
            )}
        </div>
    );
}
