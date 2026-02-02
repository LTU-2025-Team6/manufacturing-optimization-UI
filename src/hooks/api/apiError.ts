import { IProblemDetails } from '../../types/IProblemDetails';

export function parseApiError(error: any): IProblemDetails {
    if (!error)
        return { title: 'Unknown error' };
    if (typeof error === 'object' && (error.title || error.detail || error.status))
        return error as IProblemDetails;
    if (typeof error === 'string') {
        try {
            const parsed = JSON.parse(error);
            if (parsed && (parsed.title || parsed.detail || parsed.status)) {
                parsed;
            }
        } catch {}
        return { title: error };
    }
    return { title: error.message || 'Unknown error' };
}
