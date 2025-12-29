export type ExportFormat = 'pdf' | 'csv';
export type ExportType = 'detailed' | 'summary';
export type ExportScope = 'single' | 'all';

export interface ExportConfig {
  format: ExportFormat;
  type: ExportType;
  scope: ExportScope;
  userId?: string;
  userName?: string;
  startDate: string;
  endDate: string;
  selectedUserIds?: string[];
  selectedActivityIds?: string[];
}

export interface ExportDetailedRow {
  date: string;
  userName: string;
  activity: string;
  startTime: string;
  endTime: string;
  duration: string;
  durationMinutes: number;
  notes: string;
}

export interface ExportSummaryRow {
  userName: string;
  date: string;
  totalMinutes: number;
  totalHours: string;
  entryCount: number;
  activityBreakdown: Record<string, number>;
}

export interface ExportMetadata {
  dateRange: string;
  generatedAt: string;
  timezone: string;
  scope: string;
}
