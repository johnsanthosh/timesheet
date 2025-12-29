import { formatTimeForDisplay, calculateDuration } from '../utils/timezone';
import type { TimeEntry as TimeEntryType, Activity } from '../types';

interface TimeEntryProps {
  entry: TimeEntryType;
  activities: Activity[];
  onEdit: (entry: TimeEntryType) => void;
  onDelete: (id: string) => void;
}

export function TimeEntry({ entry, activities, onEdit, onDelete }: TimeEntryProps) {
  const activity = activities.find((a) => a.id === entry.activity);
  const duration = calculateDuration(entry.startTime, entry.endTime);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div
          className="w-3 h-12 rounded-full"
          style={{ backgroundColor: activity?.color || '#6B7280' }}
        />
        <div>
          <div className="font-medium text-gray-900">
            {activity?.label || entry.activity}
          </div>
          <div className="text-sm text-gray-500">
            {formatTimeForDisplay(entry.startTime)} -{' '}
            {formatTimeForDisplay(entry.endTime)}
            <span className="ml-2 text-gray-400">({duration})</span>
          </div>
          {entry.notes && (
            <div className="text-sm text-gray-400 mt-1">{entry.notes}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(entry)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
