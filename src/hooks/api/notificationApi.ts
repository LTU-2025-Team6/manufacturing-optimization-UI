import { useApi } from './useApi';
import { INotification, INotificationPreview, PagedResult, DEFAULT_PAGE_SIZE } from '../../types';

/**
 * Get all notifications - paginated
 */
export function useGetAllNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<PagedResult<INotificationPreview>>();

    const callApi = (pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
        return callApiBase({ url: `/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get new (unread) notifications
 */
export function useGetNewNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotificationPreview[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/notifications/new' });
    };

    return { data, loading, error, callApi };
}

/**
 * Get recent notifications
 */
export function useGetRecentNotifications() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotificationPreview[]>();

    const callApi = () => {
        return callApiBase({ url: '/api/notifications/recent' });
    };

    return { data, loading, error, callApi };
}


/**
 * Get notifications since a specific timestamp
 */
export function useGetNotificationsSince() {
    const { data, loading, error, callApi: callApiBase } = useApi<INotificationPreview[]>();

    const callApi = (since: string) => {
        return callApiBase({ url: `/api/notifications/since?since=${encodeURIComponent(since)}` });
    };

    return { data, loading, error, callApi };
}

/**
 * Get a single notification by Id - Returns full notification with message
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
