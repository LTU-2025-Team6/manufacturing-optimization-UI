import { NotificationType } from '../enums/notificationType';

/**
 * Preview information about a notification for list views.
 */
export interface INotificationPreview {
  id: string;
  title: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  source: string;
}

/**
 * Complete notification with full message.
 */
export interface INotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  source: string;
}
