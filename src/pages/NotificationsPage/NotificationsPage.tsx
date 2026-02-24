import { useEffect, useState, type ReactElement } from 'react';
import { useGetAllNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/api/notificationApi';
import { INotification, NotificationType } from '../../types/INotification';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loading from '../../components/loading/Loading';
import Alert from '../../components/Alert/Alert';
import './NotificationsPage.css';

const NotificationsPage = (): ReactElement => {
    const { data, loading, error, callApi } = useGetAllNotifications();
    const { callApi: markAsRead } = useMarkNotificationAsRead();
    const { callApi: markAllAsRead } = useMarkAllNotificationsAsRead();
    
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

    useEffect(() => {
        callApi();
    }, []);

    useEffect(() => {
        if (data) {
            setNotifications(data);
        }
    }, [data]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            if (selectedNotification?.id === id) {
                setSelectedNotification({ ...selectedNotification, isRead: true });
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            if (selectedNotification) {
                setSelectedNotification({ ...selectedNotification, isRead: true });
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = (notification: INotification) => {
        setSelectedNotification(notification);
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
    };

    const getNotificationIcon = (type: NotificationType): string => {
        // Handle both string and number values from backend
        const typeStr = String(type).toLowerCase();
        const typeNum = Number(type);
        
        if (typeStr === 'success' || typeNum === 1) {
            return 'check_circle';
        } else if (typeStr === 'warning' || typeNum === 2) {
            return 'warning';
        } else if (typeStr === 'error' || typeNum === 3) {
            return 'error';
        }
        return 'info';
    };

    const getNotificationTypeClass = (type: NotificationType): string => {
        // Handle both string and number values from backend
        const typeStr = String(type).toLowerCase();
        const typeNum = Number(type);
        
        if (typeStr === 'info' || typeNum === 0) {
            return 'info';
        } else if (typeStr === 'success' || typeNum === 1) {
            return 'success';
        } else if (typeStr === 'warning' || typeNum === 2) {
            return 'warning';
        } else if (typeStr === 'error' || typeNum === 3) {
            return 'error';
        }
        return 'info';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading && !data) {
        return <Loading />;
    }

    if (error) {
        return (
            <Alert variant="error" title="Failed to load notifications">
                <p>{error.detail || 'An error occurred while loading notifications'}</p>
            </Alert>
        );
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="unread-count">{unreadCount} unread</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button onClick={handleMarkAllAsRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="notifications-container">
                <div className="notifications-sidebar">
                    <Card>
                        <div className="notifications-list-container">
                            <h3>All notifications</h3>
                            {notifications.length === 0 ? (
                                <div className="notifications-empty">
                                    <MaterialIcon icon="notifications_none" size="M" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                <div className="notifications-list">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification-list-item ${notification.isRead ? 'read' : 'unread'} ${selectedNotification?.id === notification.id ? 'selected' : ''} type-${getNotificationTypeClass(notification.type)}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="notification-list-icon">
                                                <MaterialIcon
                                                    icon={getNotificationIcon(notification.type)}
                                                    size="S"
                                                />
                                            </div>
                                            <div className="notification-list-content">
                                                <div className="notification-list-title">{notification.title}</div>
                                                <div className="notification-list-time">
                                                    {formatDate(notification.createdAt)}
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="notification-list-unread-dot" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="notifications-detail">
                    {selectedNotification ? (
                        <Card>
                            <div className="notification-detail-content">
                                <div className="notification-detail-header">
                                    <div className={`notification-detail-icon type-${getNotificationTypeClass(selectedNotification.type)}`}>
                                        <MaterialIcon
                                            icon={getNotificationIcon(selectedNotification.type)}
                                            size="M"
                                        />
                                    </div>
                                    <div className="notification-detail-meta">
                                        <h2>{selectedNotification.title}</h2>
                                        <div className="notification-detail-info">
                                            <span className="notification-detail-type">
                                                {NotificationType[selectedNotification.type]}
                                            </span>
                                            <span className="notification-detail-separator">•</span>
                                            <span className="notification-detail-time">
                                                {formatDate(selectedNotification.createdAt)}
                                            </span>
                                            {selectedNotification.source && (
                                                <>
                                                    <span className="notification-detail-separator">•</span>
                                                    <span className="notification-detail-source">
                                                        {selectedNotification.source}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="notification-detail-message">
                                    {selectedNotification.message}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <div className="notification-detail-empty">
                                <MaterialIcon icon="notifications" size="L" />
                                <p>Select a notification to view details</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
