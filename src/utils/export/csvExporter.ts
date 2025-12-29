import type { Activity } from '../../types';
import type { ExportDetailedRow, ExportSummaryRow, ExportMetadata } from './types';
import { formatMinutesToHours } from './dataTransformer';

function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateDetailedCSV(rows: ExportDetailedRow[], metadata: ExportMetadata): string {
  const headers = ['Date', 'User', 'Activity', 'Start Time', 'End Time', 'Duration', 'Notes'];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const values = [
      escapeCSV(row.date),
      escapeCSV(row.userName),
      escapeCSV(row.activity),
      escapeCSV(row.startTime),
      escapeCSV(row.endTime),
      escapeCSV(row.duration),
      escapeCSV(row.notes),
    ];
    csvRows.push(values.join(','));
  }

  const totalMinutes = rows.reduce((sum, row) => sum + row.durationMinutes, 0);
  csvRows.push('');
  csvRows.push(`Total Hours,${formatMinutesToHours(totalMinutes)}`);
  csvRows.push(`Generated,${metadata.generatedAt}`);
  csvRows.push(`Timezone,${metadata.timezone}`);

  return csvRows.join('\n');
}

export function generateSummaryCSV(
  rows: ExportSummaryRow[],
  activities: Activity[],
  metadata: ExportMetadata
): string {
  const activityLabels = activities.map(a => a.label);
  const headers = ['User', 'Date', 'Total Hours', 'Entries', ...activityLabels];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const activityValues = activityLabels.map(label =>
      row.activityBreakdown[label] ? formatMinutesToHours(row.activityBreakdown[label]) : ''
    );
    const values = [
      escapeCSV(row.userName),
      escapeCSV(row.date),
      escapeCSV(row.totalHours),
      String(row.entryCount),
      ...activityValues.map(escapeCSV),
    ];
    csvRows.push(values.join(','));
  }

  const totalMinutes = rows.reduce((sum, row) => sum + row.totalMinutes, 0);
  csvRows.push('');
  csvRows.push(`Total Hours,${formatMinutesToHours(totalMinutes)}`);
  csvRows.push(`Generated,${metadata.generatedAt}`);
  csvRows.push(`Timezone,${metadata.timezone}`);

  return csvRows.join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
