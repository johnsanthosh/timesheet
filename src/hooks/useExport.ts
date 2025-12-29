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
import {
  getTimeEntriesByDateRange,
  getAllTimeEntriesByDateRange,
} from '../services/timesheet';
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
      const entries =
        config.scope === 'single' && config.userId
          ? await getTimeEntriesByDateRange(config.userId, config.startDate, config.endDate)
          : await getAllTimeEntriesByDateRange(config.startDate, config.endDate);

      if (entries.length === 0) {
        setExportError('No time entries found for the selected date range.');
        setIsExporting(false);
        return;
      }

      const metadata: ExportMetadata = {
        dateRange: `${config.startDate} to ${config.endDate}`,
        generatedAt: format(new Date(), 'MMM d, yyyy h:mm a'),
        timezone: getTimezoneAbbreviation(),
        scope: config.scope === 'single' ? config.userName || 'Single User' : 'All Users',
      };

      const scopeLabel = config.scope === 'single' ? config.userName?.replace(/\s+/g, '-').toLowerCase() || 'user' : 'all';
      const baseFilename = `timesheet-${config.type}-${scopeLabel}-${config.startDate}-to-${config.endDate}`;

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
          const csv = generateSummaryCSV(rows, activities, metadata);
          downloadCSV(csv, `${baseFilename}.csv`);
        } else {
          const pdf = generateSummaryPDF(rows, activities, metadata);
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
