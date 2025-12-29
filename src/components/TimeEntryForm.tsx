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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {editingEntry ? 'Edit Time Entry' : 'Log Time'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="activity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Activity
          </label>
          <select
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Time
          </label>
          <div className="flex space-x-2">
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={setCurrentTimeAsStart}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Now
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Time
          </label>
          <div className="flex space-x-2">
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={setCurrentTimeAsEnd}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Now
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about this activity..."
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? 'Saving...'
            : editingEntry
            ? 'Update Entry'
            : 'Log Time'}
        </button>
      </div>
    </form>
  );
}
