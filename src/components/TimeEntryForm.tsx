import { useState, useEffect, type FormEvent } from 'react';
import { getCurrentLocalTime } from '../utils/timezone';
import type { TimeEntry, Activity } from '../types';

interface TimeEntryFormProps {
  activities: Activity[];
  onSubmit: (data: {
    activity: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  editingEntry?: TimeEntry | null;
}

export function TimeEntryForm({
  activities,
  onSubmit,
  onCancel,
  editingEntry,
}: TimeEntryFormProps) {
  const [activity, setActivity] = useState(editingEntry?.activity || '');
  const [startTime, setStartTime] = useState(
    editingEntry?.startTime || getCurrentLocalTime()
  );
  const [endTime, setEndTime] = useState(editingEntry?.endTime || '');
  const [notes, setNotes] = useState(editingEntry?.notes || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setActivity(editingEntry.activity);
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
      setNotes(editingEntry.notes || '');
    }
  }, [editingEntry]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!activity || !startTime || !endTime) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        activity,
        startTime,
        endTime,
        notes: notes || undefined,
      });

      if (!editingEntry) {
        setActivity('');
        setStartTime(getCurrentLocalTime());
        setEndTime('');
        setNotes('');
      }
    } finally {
      setLoading(false);
    }
  };

  const setCurrentTimeAsStart = () => {
    setStartTime(getCurrentLocalTime());
  };

  const setCurrentTimeAsEnd = () => {
    setEndTime(getCurrentLocalTime());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingEntry ? 'Edit Time Entry' : 'Log Time'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Activity */}
        <div className="sm:col-span-2">
          <label
            htmlFor="activity"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Activity
          </label>
          <select
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
            required
          >
            <option value="">Select an activity</option>
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Start Time
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={setCurrentTimeAsStart}
              className="px-3 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              Now
            </button>
          </div>
        </div>

        {/* End Time */}
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            End Time
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={setCurrentTimeAsEnd}
              className="px-3 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              Now
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
            placeholder="Add any notes about this activity..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {loading ? 'Saving...' : editingEntry ? 'Update Entry' : 'Log Time'}
        </button>
      </div>
    </form>
  );
}
