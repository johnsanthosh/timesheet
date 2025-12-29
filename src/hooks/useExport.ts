import { useState } from 'react';
import { format } from 'date-fns';
import type { AppUser, Activity } from '../types';
import type { ExportConfig, ExportMetadata } from '../utils/export/types';
import {
  transformToDetailedRows,
  transformToSummaryRows,
  generateDetailedCSV,
  generateSummaryCSV,
  downloadCSV,
  generateDetailedPDF,
  generateSummaryPDF,
  downloadPDF,
} from '../utils/export';
import { getAllTimeEntriesByDateRange } from '../services/timesheet';
import { getTimezoneAbbreviation } from '../utils/timezone';

interface UseExportReturn {
  isExporting: boolean;
  exportError: string | null;
  exportData: (
    config: ExportConfig,
    users: Record<string, AppUser>,
    activities: Activity[]
  ) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async (
    config: ExportConfig,
    users: Record<string, AppUser>,
    activities: Activity[]
  ): Promise<void> => {
    setIsExporting(true);
    setExportError(null);

    try {
      let entries = await getAllTimeEntriesByDateRange(config.startDate, config.endDate);

      // Filter by selected users if specified
      if (config.selectedUserIds && config.selectedUserIds.length > 0) {
        entries = entries.filter((entry) => config.selectedUserIds!.includes(entry.userId));
      }

      // Filter by selected activities if specified
      if (config.selectedActivityIds && config.selectedActivityIds.length > 0) {
        entries = entries.filter((entry) => config.selectedActivityIds!.includes(entry.activity));
      }

      if (entries.length === 0) {
        setExportError('No time entries found for the selected filters.');
        setIsExporting(false);
        return;
      }

      // Build scope description for metadata
      let scopeDescription = 'All Users';
      if (config.selectedUserIds && config.selectedUserIds.length > 0) {
        const selectedUserNames = config.selectedUserIds
          .map((id) => users[id]?.displayName || 'Unknown')
          .join(', ');
        scopeDescription = config.selectedUserIds.length === 1
          ? selectedUserNames
          : `${config.selectedUserIds.length} users`;
      }

      // Add activity filter to scope description
      if (config.selectedActivityIds && config.selectedActivityIds.length > 0) {
        const selectedActivityNames = config.selectedActivityIds
          .map((id) => activities.find((a) => a.id === id)?.label || id)
          .join(', ');
        const activityDesc = config.selectedActivityIds.length === 1
          ? selectedActivityNames
          : `${config.selectedActivityIds.length} activities`;
        scopeDescription += ` | ${activityDesc}`;
      }

      const metadata: ExportMetadata = {
        dateRange: `${config.startDate} to ${config.endDate}`,
        generatedAt: format(new Date(), 'MMM d, yyyy h:mm a'),
        timezone: getTimezoneAbbreviation(),
        scope: scopeDescription,
      };

      // Build filename
      let scopeLabel = 'all';
      if (config.selectedUserIds && config.selectedUserIds.length > 0) {
        if (config.selectedUserIds.length === 1) {
          const userName = users[config.selectedUserIds[0]]?.displayName || 'user';
          scopeLabel = userName.replace(/\s+/g, '-').toLowerCase();
        } else {
          scopeLabel = `${config.selectedUserIds.length}-users`;
        }
      }
      const baseFilename = `timesheet-${config.type}-${scopeLabel}-${config.startDate}-to-${config.endDate}`;

      // Filter activities list for summary export (only include selected or all)
      const filteredActivities = config.selectedActivityIds && config.selectedActivityIds.length > 0
        ? activities.filter((a) => config.selectedActivityIds!.includes(a.id))
        : activities;

      if (config.type === 'detailed') {
        const rows = transformToDetailedRows(entries, users, activities);

        if (config.format === 'csv') {
          const csv = generateDetailedCSV(rows, metadata);
          downloadCSV(csv, `${baseFilename}.csv`);
        } else {
          const pdf = generateDetailedPDF(rows, metadata);
          downloadPDF(pdf, `${baseFilename}.pdf`);
        }
      } else {
        const rows = transformToSummaryRows(entries, users, activities);

        if (config.format === 'csv') {
          const csv = generateSummaryCSV(rows, filteredActivities, metadata);
          downloadCSV(csv, `${baseFilename}.csv`);
        } else {
          const pdf = generateSummaryPDF(rows, filteredActivities, metadata);
          downloadPDF(pdf, `${baseFilename}.pdf`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportError,
    exportData,
  };
}
