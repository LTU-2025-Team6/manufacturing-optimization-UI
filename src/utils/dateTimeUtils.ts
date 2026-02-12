/**
 * Converts ISO 8601 UTC datetime string to datetime-local input format
 * datetime-local expects format: "YYYY-MM-DDTHH:mm" in local timezone
 * @param isoString - ISO 8601 datetime string (UTC)
 * @returns datetime-local format string in browser's local timezone
 */
export function toLocalDateTimeInput(isoString: string): string {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
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
    
    const date = new Date(isoString);
    
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
