/**
 * Ensures an ISO datetime string is treated as UTC.
 * If the string has no timezone suffix (no Z, no +HH:mm), appends Z.
 * Use this when parsing timestamps received from the server.
 */
export function ensureUtc(isoString: string): string {
    if (!isoString) return isoString;
    // Already has timezone info
    if (isoString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(isoString)) {
        return isoString;
    }
    return isoString + 'Z';
}

/**
 * Date and Time Utilities
 * 
 * IMPORTANT: All functions work with UTC timestamps stored as ISO 8601 strings.
 * - Server sends dates in UTC (e.g., "2024-02-24T10:30:00Z")
 * - These utilities parse UTC strings and display them in the user's local timezone
 * - Always use these utilities instead of direct Date manipulation for consistency
 */

/**
 * Converts ISO 8601 UTC datetime string to datetime-local input format
 * datetime-local expects format: "YYYY-MM-DDTHH:mm" in local timezone
 * @param isoString - ISO 8601 datetime string (UTC)
 * @returns datetime-local format string in browser's local timezone
 */
export function toLocalDateTimeInput(isoString: string): string {
    if (!isoString) return '';
    
    const date = new Date(ensureUtc(isoString));
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', isoString);
        return '';
    }
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    // Get local date components
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts datetime-local input value to ISO 8601 UTC string
 * datetime-local provides format: "YYYY-MM-DDTHH:mm" in local timezone
 * @param localDateTimeString - datetime-local input value (local timezone)
 * @returns ISO 8601 datetime string (UTC)
 */
export function fromLocalDateTimeInput(localDateTimeString: string): string {
    if (!localDateTimeString) return '';
    
    // datetime-local returns "YYYY-MM-DDTHH:mm" in local time
    // Add seconds for complete format
    const localDateString = localDateTimeString.length === 16 
        ? localDateTimeString + ':00' 
        : localDateTimeString;
    
    const date = new Date(localDateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', localDateTimeString);
        return '';
    }
    
    return date.toISOString();
}

/**
 * Formats ISO 8601 datetime string for display in browser's local timezone
 * @param isoString - ISO 8601 datetime string (UTC)
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted datetime string in local timezone
 */
export function formatDateTime(isoString: string, options?: Intl.DateTimeFormatOptions): string {
    if (!isoString) return 'Not set';
    
    const date = new Date(ensureUtc(isoString));
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', isoString);
        return 'Invalid date';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    
    return date.toLocaleString('en-US', defaultOptions);
}

/**
 * Formats ISO 8601 datetime string for display in UTC (for timeline labels, server-side context).
 * Use this when you want to show the exact UTC value that is stored on the server.
 */
export function formatDateTimeUtc(isoString: string, options?: Intl.DateTimeFormatOptions): string {
    return formatDateTime(isoString, { timeZone: 'UTC', ...options });
}

/**
 * Formats date-only string (YYYY-MM-DD) for display without timezone conversion
 * Use this for date strings that don't include time information
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateOnly(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateString) return 'Not set';
    
    // Parse as local date to avoid timezone shifting
    // dateString format: "YYYY-MM-DD"
    const parts = dateString.split('-');
    if (parts.length !== 3) {
        console.error('Invalid date format:', dateString);
        return 'Invalid date';
    }
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options
    };
    
    return date.toLocaleDateString('en-US', defaultOptions);
}
