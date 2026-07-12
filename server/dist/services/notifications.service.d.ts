export interface NotificationSettings {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    bookingReminders?: boolean;
    maintenanceAlerts?: boolean;
    auditNotifications?: boolean;
}
export declare const notificationsService: {
    listNotifications(userId: string, page: number, limit: number): Promise<{
        data: {
            userId: string;
            id: string;
            createdAt: Date;
            link: string | null;
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            isRead: boolean;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        updatedCount: boolean;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
};
//# sourceMappingURL=notifications.service.d.ts.map