import { useEffect, useState, useRef, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTwoWeekNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/api/notificationApi';
import { INotification, NotificationType } from '../../types/INotification';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './NotificationHub.css';

const POLL_INTERVAL = 1000; // 1 second
const STAGGER_DELAY = 80; // milliseconds between each notification appearance

interface NotificationHubProps {
    isCollapsed: boolean;
    onToggleCollapse: (collapsed: boolean) => void;
}

const NotificationHub = ({ isCollapsed, onToggleCollapse }: NotificationHubProps): ReactElement => {
    const navigate = useNavigate();
    const { data, callApi } = useGetTwoWeekNotifications();
    const { callApi: markAsRead } = useMarkNotificationAsRead();
    const { callApi: markAllAsRead } = useMarkAllNotificationsAsRead();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());
    const shownNotificationsRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);

    // Initial load
    useEffect(() => {
        callApi();
    }, []);

    // Update notifications when data changes
    useEffect(() => {
        if (data) {
            // Sort notifications by createdAt DESC (newest first)
            const sortedData = [...data].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setNotifications(sortedData);
            
            // On first load, show all notifications immediately without animation
            if (isFirstLoadRef.current) {
                isFirstLoadRef.current = false;
                sortedData.forEach(n => {
                    shownNotificationsRef.current.add(n.id);
                    setVisibleNotifications(prev => new Set([...prev, n.id]));
                });
                return;
            }
            
            // Identify new notifications that haven't been shown before
            const newNotifications = sortedData.filter(n => !shownNotificationsRef.current.has(n.id));
            
            if (newNotifications.length > 0) {
                // Add new notifications to shown set
                newNotifications.forEach(n => shownNotificationsRef.current.add(n.id));
                
                // Stagger the appearance of new notifications
                // Start with the oldest new notification first (from bottom to top)
                const reversedNew = [...newNotifications].reverse();
                reversedNew.forEach((notification, index) => {
                    setTimeout(() => {
                        setVisibleNotifications(prev => new Set([...prev, notification.id]));
                    }, index * STAGGER_DELAY);
                });
            }
        }
    }, [data]);

    // Polling for new notifications
    useEffect(() => {
        const interval = setInterval(() => {
            callApi();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [callApi]);

    // Mark all unread notifications as read when panel is expanded
    useEffect(() => {
        if (!isCollapsed && notifications.length > 0) {
            const unreadNotifications = notifications.filter(n => !n.isRead);
            if (unreadNotifications.length > 0) {
                // Mark all as read
                markAllAsRead().then(() => {
                    // Update local state
                    setNotifications(prev =>
                        prev.map(n => ({ ...n, isRead: true }))
                    );
                }).catch(error => {
                    console.error('Failed to mark notifications as read:', error);
                });
            }
        }
    }, [isCollapsed, notifications, markAllAsRead]);

    const handleNotificationClick = async (notification: INotification) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification.id);
                // Update local state
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
    };

    const handleViewAll = () => {
        navigate('/notifications');
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

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={`notification-hub ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            {isCollapsed ? (
                // Collapsed state - minimal indicator
                <div className="notification-hub-collapsed">
                    <button
                        className="notification-hub-toggle"
                        onClick={() => onToggleCollapse(false)}
                        aria-label="Expand notifications"
                        title="Expand notifications"
                    >
                        <MaterialIcon icon="notifications" size="S" />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                </div>
            ) : (
                // Expanded state - full panel
                <div className="notification-hub-panel">
                    <div className="notification-hub-header">
                        <h3>Notifications</h3>
                        <div className="notification-hub-actions">
                            <button
                                className="action-button"
                                onClick={handleViewAll}
                                title="View all notifications"
                            >
                                <MaterialIcon icon="open_in_new" size="S" />
                            </button>
                            <button
                                className="action-button"
                                onClick={() => onToggleCollapse(true)}
                                title="Collapse panel"
                            >
                                <MaterialIcon icon="chevron_right" size="S" />
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <MaterialIcon icon="notifications_none" size="M" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isVisible = visibleNotifications.has(notification.id);
                                return (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.isRead ? 'read' : 'unread'} type-${getNotificationTypeClass(notification.type)} ${isVisible ? 'notification-visible' : 'notification-hidden'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        <MaterialIcon 
                                            icon={getNotificationIcon(notification.type)} 
                                            size="S"
                                        />
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-meta">
                                            <span className="notification-time">
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                            {notification.source && (
                                                <span className="notification-source">
                                                    {notification.source}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="notification-unread-dot" />
                                    )}
                                </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationHub;
