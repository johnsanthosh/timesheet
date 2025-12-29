import { useState, type FormEvent } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { AppUser, Activity } from '../types';
import type { ExportFormat, ExportType, ExportScope, ExportConfig } from '../utils/export/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: Record<string, AppUser>;
  activities: Activity[];
  onExport: (
    config: ExportConfig,
    users: Record<string, AppUser>,
    activities: Activity[]
  ) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
}

export function ExportModal({
  isOpen,
  onClose,
  users,
  activities,
  onExport,
  isExporting,
  exportError,
}: ExportModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exportType, setExportType] = useState<ExportType>('detailed');
  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [selectedUserId, setSelectedUserId] = useState('');

  if (!isOpen) return null;

  const userList = Object.values(users).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  const handleQuickSelect = (type: 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last30') => {
    const now = new Date();
    switch (type) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'thisWeek':
        setStartDate(format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'thisMonth':
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case 'last30':
        setStartDate(format(subDays(now, 30), 'yyyy-MM-dd'));
        setEndDate(today);
        break;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const selectedUser = selectedUserId ? users[selectedUserId] : undefined;

    const config: ExportConfig = {
      format: exportFormat,
      type: exportType,
      scope: exportScope,
      userId: exportScope === 'single' ? selectedUserId : undefined,
      userName: exportScope === 'single' ? selectedUser?.displayName : undefined,
      startDate,
      endDate,
    };

    await onExport(config, users, activities);

    if (!exportError) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100 z-10">
            <h2 className="text-lg font-semibold text-gray-900">Export Timesheet</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'thisWeek', label: 'This Week' },
                  { key: 'thisMonth', label: 'This Month' },
                  { key: 'lastMonth', label: 'Last Month' },
                  { key: 'last30', label: 'Last 30 Days' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleQuickSelect(item.key as any)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={() => setExportFormat('pdf')}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">PDF</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">CSV</span>
                </label>
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportType === 'detailed'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="detailed"
                    checked={exportType === 'detailed'}
                    onChange={() => setExportType('detailed')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Detailed</span>
                    <p className="text-xs text-gray-500 mt-0.5">Individual entries with time, activity, and notes</p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportType === 'summary'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="summary"
                    checked={exportType === 'summary'}
                    onChange={() => setExportType('summary')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Summary</span>
                    <p className="text-xs text-gray-500 mt-0.5">Daily totals with activity breakdown per user</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Users
              </label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <label
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportScope === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="all"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">All Users</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    exportScope === 'single'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="single"
                    checked={exportScope === 'single'}
                    onChange={() => setExportScope('single')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">Single User</span>
                </label>
              </div>
              {exportScope === 'single' && (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  required={exportScope === 'single'}
                >
                  <option value="">Select a user</option>
                  {userList.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Error */}
            {exportError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{exportError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isExporting || (exportScope === 'single' && !selectedUserId)}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                {isExporting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
