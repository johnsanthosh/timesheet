import { formatTimeForDisplay, calculateDuration } from '../utils/timezone';
import type { TimeEntry as TimeEntryType, Activity } from '../types';

interface TimeEntryProps {
  entry: TimeEntryType;
  activities: Activity[];
  onEdit: (entry: TimeEntryType) => void;
  onDelete: (id: string) => void;
  showUser?: boolean;
  userName?: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function TimeEntry({ entry, activities, onEdit, onDelete, showUser, userName, canEdit = true, canDelete = true }: TimeEntryProps) {
  const activity = activities.find((a) => a.id === entry.activity);
  const duration = calculateDuration(entry.startTime, entry.endTime);
  const isInProgress = !entry.endTime;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow ${isInProgress ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Color Bar and Content */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-1 sm:w-1.5 h-12 sm:h-14 rounded-full flex-shrink-0 ${isInProgress ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: activity?.color || '#6B7280' }}
          />
          <div className="flex-1 min-w-0">
            {showUser && userName && (
              <div className="text-xs font-medium text-gray-500 mb-0.5">{userName}</div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {activity?.label || entry.activity}
              </span>
              {isInProgress && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  In Progress
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mt-0.5">
              <span>
                {formatTimeForDisplay(entry.startTime)}{entry.endTime ? ` - ${formatTimeForDisplay(entry.endTime)}` : ' - ...'}
              </span>
              {duration && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {duration}
                </span>
              )}
            </div>
            {entry.notes && (
              <div className="text-sm text-gray-400 mt-1.5 line-clamp-2">{entry.notes}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-0 flex-shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Edit entry"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (canDelete) onDelete(entry.id);
              }}
              disabled={!canDelete}
              className={`p-2 rounded-lg transition-colors ${
                canDelete
                  ? 'text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Delete entry"
              title={!canDelete ? 'Cannot delete - add end time first' : 'Delete entry'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
