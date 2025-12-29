import type { TimeEntry, AppUser, Activity } from '../../types';
import type { ExportDetailedRow, ExportSummaryRow } from './types';
import { calculateDuration, formatTimeForDisplay } from '../timezone';
import { format, parse } from 'date-fns';

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  return totalMinutes;
}

function formatDate(dateStr: string): string {
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(parsed, 'MMM d, yyyy');
}

function getActivityLabel(activityId: string, activities: Activity[]): string {
  const activity = activities.find(a => a.id === activityId);
  return activity?.label || activityId;
}

export function transformToDetailedRows(
  entries: TimeEntry[],
  users: Record<string, AppUser>,
  activities: Activity[]
): ExportDetailedRow[] {
  return entries
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const userCompare = (users[a.userId]?.displayName || '').localeCompare(users[b.userId]?.displayName || '');
      if (userCompare !== 0) return userCompare;
      return a.startTime.localeCompare(b.startTime);
    })
    .map((entry) => ({
      date: formatDate(entry.date),
      userName: users[entry.userId]?.displayName || 'Unknown User',
      activity: getActivityLabel(entry.activity, activities),
      startTime: formatTimeForDisplay(entry.startTime),
      endTime: formatTimeForDisplay(entry.endTime),
      duration: calculateDuration(entry.startTime, entry.endTime),
      durationMinutes: calculateDurationMinutes(entry.startTime, entry.endTime),
      notes: entry.notes || '',
    }));
}

export function transformToSummaryRows(
  entries: TimeEntry[],
  users: Record<string, AppUser>,
  activities: Activity[]
): ExportSummaryRow[] {
  const summaryMap: Record<string, ExportSummaryRow> = {};

  for (const entry of entries) {
    const key = `${entry.userId}-${entry.date}`;
    const durationMinutes = calculateDurationMinutes(entry.startTime, entry.endTime);
    const activityLabel = getActivityLabel(entry.activity, activities);

    if (!summaryMap[key]) {
      summaryMap[key] = {
        userName: users[entry.userId]?.displayName || 'Unknown User',
        date: formatDate(entry.date),
        totalMinutes: 0,
        totalHours: '',
        entryCount: 0,
        activityBreakdown: {},
      };
    }

    summaryMap[key].totalMinutes += durationMinutes;
    summaryMap[key].entryCount += 1;
    summaryMap[key].activityBreakdown[activityLabel] =
      (summaryMap[key].activityBreakdown[activityLabel] || 0) + durationMinutes;
  }

  const rows = Object.values(summaryMap);

  for (const row of rows) {
    const hours = Math.floor(row.totalMinutes / 60);
    const minutes = row.totalMinutes % 60;
    row.totalHours = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return rows.sort((a, b) => {
    const userCompare = a.userName.localeCompare(b.userName);
    if (userCompare !== 0) return userCompare;
    return a.date.localeCompare(b.date);
  });
}

export function formatMinutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
