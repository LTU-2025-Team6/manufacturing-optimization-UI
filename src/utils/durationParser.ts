export function parseDuration(duration: string): string {
    // Duration is in format like "1.05:30:00" (days.hours:minutes:seconds)
    const match = duration.match(/(\d+)\.(\d+):(\d+):(\d+)/);
    if (match) {
        const days = parseInt(match[1]);
        const hours = parseInt(match[2]);
        const totalHours = days * 24 + hours;
        return `${days}.${hours.toString().padStart(2, '0')} days (${totalHours.toFixed(1)} hours)`;
    }
    return duration;
}
