import { format, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

// Get user's browser timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Get current date in user's local timezone (YYYY-MM-DD)
export function getCurrentLocalDate(): string {
  const timezone = getUserTimezone();
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

// Get current time in user's local timezone (HH:mm)
export function getCurrentLocalTime(): string {
  const timezone = getUserTimezone();
  return formatInTimeZone(new Date(), timezone, 'HH:mm');
}

// Convert local time (HH:mm) to UTC time (HH:mm) for storage
// Takes a date string and local time, returns UTC time
export function localTimeToUTC(date: string, localTime: string): string {
  const timezone = getUserTimezone();
  // Create a date object in the user's timezone
  const localDateTime = parse(`${date} ${localTime}`, 'yyyy-MM-dd HH:mm', new Date());
  // Convert to UTC
  const utcDate = fromZonedTime(localDateTime, timezone);
  return format(utcDate, 'HH:mm');
}

// Convert UTC time (HH:mm) to local time (HH:mm) for display
// Takes a date string and UTC time, returns local time
export function utcTimeToLocal(date: string, utcTime: string): string {
  const timezone = getUserTimezone();
  // Create a UTC date object
  const utcDateTime = parse(`${date} ${utcTime}`, 'yyyy-MM-dd HH:mm', new Date());
  // Convert to user's timezone
  const localDate = toZonedTime(utcDateTime, timezone);
  return format(localDate, 'HH:mm');
}

// Format date for display (e.g., "Monday, January 1, 2024")
export function formatDateForDisplay(date: string): string {
  const parsed = parse(date, 'yyyy-MM-dd', new Date());
  return format(parsed, 'EEEE, MMMM d, yyyy');
}

// Format time for display (e.g., "9:30 AM")
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate duration between two times (both should be in same timezone)
// Returns null if endTime is not provided (entry in progress)
export function calculateDuration(startTime: string, endTime?: string): string | null {
  if (!endTime) {
    return null;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Handle overnight
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

// Get timezone abbreviation for display
export function getTimezoneAbbreviation(): string {
  const timezone = getUserTimezone();
  return formatInTimeZone(new Date(), timezone, 'zzz');
}

// Get full timezone name for display
export function getTimezoneName(): string {
  return getUserTimezone().replace(/_/g, ' ');
}
