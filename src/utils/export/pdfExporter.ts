import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Activity } from '../../types';
import type { ExportDetailedRow, ExportSummaryRow, ExportMetadata } from './types';
import { formatMinutesToHours } from './dataTransformer';

function addHeader(doc: jsPDF, title: string, metadata: ExportMetadata): number {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Range: ${metadata.dateRange}`, 14, 28);
  doc.text(`Scope: ${metadata.scope}`, 14, 34);
  doc.text(`Generated: ${metadata.generatedAt} (${metadata.timezone})`, 14, 40);

  return 48;
}

function addFooter(doc: jsPDF, totalMinutes: number): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount} | Total Hours: ${formatMinutesToHours(totalMinutes)}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }
}

export function generateDetailedPDF(
  rows: ExportDetailedRow[],
  metadata: ExportMetadata
): jsPDF {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Timesheet Report - Detailed', metadata);

  const tableData = rows.map((row) => [
    row.date,
    row.userName,
    row.activity,
    row.startTime,
    row.endTime,
    row.duration,
    row.notes.length > 40 ? row.notes.substring(0, 40) + '...' : row.notes,
  ]);

  autoTable(doc, {
    startY,
    head: [['Date', 'User', 'Activity', 'Start', 'End', 'Duration', 'Notes']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 25 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 'auto' },
    },
  });

  const totalMinutes = rows.reduce((sum, row) => sum + row.durationMinutes, 0);
  addFooter(doc, totalMinutes);

  return doc;
}

export function generateSummaryPDF(
  rows: ExportSummaryRow[],
  activities: Activity[],
  metadata: ExportMetadata
): jsPDF {
  const doc = new jsPDF('landscape');
  const startY = addHeader(doc, 'Timesheet Report - Summary', metadata);

  const activityLabels = activities.map((a) => a.label);
  const headers = ['User', 'Date', 'Total', 'Entries', ...activityLabels];

  const tableData = rows.map((row) => {
    const activityValues = activityLabels.map((label) =>
      row.activityBreakdown[label] ? formatMinutesToHours(row.activityBreakdown[label]) : '-'
    );
    return [row.userName, row.date, row.totalHours, String(row.entryCount), ...activityValues];
  });

  autoTable(doc, {
    startY,
    head: [headers],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const totalMinutes = rows.reduce((sum, row) => sum + row.totalMinutes, 0);
  addFooter(doc, totalMinutes);

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
