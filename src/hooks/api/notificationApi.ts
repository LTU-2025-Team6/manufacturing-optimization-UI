import { useApi } from './useApi';
import { INotification } from '../../types/INotification';

/**
 * Get all notifications
 */
export function useGetAllNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotification[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/notifications' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get new (unread) notifications
 */
export function useGetNewNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotification[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/notifications/new' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get recent notifications (default: last 10)
 */
export function useGetRecentNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotification[]>();

    const callApi = (count: number = 10) => {
        return callApiBase({ url: `/api/notifications/recent?count=${count}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get notifications from the last two weeks
 */
export function useGetTwoWeekNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotification[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/notifications/two-weeks' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get a single notification by Id
 */
export function useGetNotification() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotification>();

    const callApi = (id: string) => {
        return callApiBase({ url: `/api/notifications/${id}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Mark a notification as read
 */
export function useMarkNotificationAsRead() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = (id: string) => {
        return callApiBase({ 
            url: `/api/notifications/${id}/read`, 
            method: 'PATCH' 
        });
    };

    return { data, loading, error, callApi };
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
    const { data, loading, error, callApi: callApiBase } = useApi<void>();

    const callApi = () => {
        return callApiBase({ 
            url: '/api/notifications/read-all', 
            method: 'PATCH' 
        });
    };

    return { data, loading, error, callApi };
}
