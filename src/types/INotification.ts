export enum NotificationType {
    Info = 0,
    Success = 1,
    Warning = 2,
    Error = 3
}

export interface INotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
    source: string;
}

export interface INotificationPreview {
    id: string;
    title: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    source: string;
}
