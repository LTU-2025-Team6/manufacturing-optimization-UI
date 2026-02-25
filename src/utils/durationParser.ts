export const parseDuration = (durationString: string | undefined | null): number => {
    if (!durationString) return 0;
    
    // Attempt to parse standard format HH:MM:SS
    const parts = durationString.split(':');
    if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    // Check for C# TimeSpan string representation e.g. "1.02:30:00"
    const dayParts = durationString.split('.');
    if (dayParts.length === 2) {
        const days = parseInt(dayParts[0], 10);
        const timeParts = dayParts[1].split(':');
        
        if (timeParts.length === 3) {
             const hours = parseInt(timeParts[0], 10);
             const minutes = parseInt(timeParts[1], 10);
             const seconds = parseInt(timeParts[2], 10);
             
             return (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
        }
    }

    // Fallback: assume it's already a number representing hours if numeric
    const parsed = parseFloat(durationString);
    return isNaN(parsed) ? 0 : parsed * 3600; 
};

// 👇 ADD THIS FUNCTION
export const formatDuration = (hours: number | undefined | null): string => {
    if (hours === undefined || hours === null) return "0h";
    
    // Just display it nicely (e.g., "1.5h")
    return `${hours.toFixed(1)}h`;
};