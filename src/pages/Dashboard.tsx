import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { TimeEntry } from '../components/TimeEntry';
import { TimeEntryForm } from '../components/TimeEntryForm';
import {
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getUserTimeEntries,
} from '../services/timesheet';
import { getActivities } from '../services/activities';
import {
  getCurrentLocalDate,
  formatDateForDisplay,
} from '../utils/timezone';
import type { TimeEntry as TimeEntryType, Activity } from '../types';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { appUser } = useAuth();
  const [entries, setEntries] = useState<TimeEntryType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentLocalDate());
  const [editingEntry, setEditingEntry] = useState<TimeEntryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [appUser?.uid, selectedDate]);

  const loadActivities = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadEntries = async () => {
    if (!appUser?.uid) return;

    setLoading(true);
    try {
      const data = await getUserTimeEntries(appUser.uid, selectedDate);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (data: {
    activity: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    if (!appUser?.uid) return;

    try {
      const newEntry = await createTimeEntry(appUser.uid, {
        ...data,
        date: selectedDate,
      });
      setEntries((prev) => [...prev, newEntry].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ));
      toast.success('Time entry added');
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create time entry');
    }
  };

  const handleUpdateEntry = async (data: {
    activity: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    if (!editingEntry) return;

    try {
      await updateTimeEntry(editingEntry.id, selectedDate, data);
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id
            ? { ...entry, ...data, updatedAt: new Date() }
            : entry
        ).sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
      setEditingEntry(null);
      toast.success('Time entry updated');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update time entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteTimeEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast.success('Time entry deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete time entry');
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(getCurrentLocalDate());
  };

  const totalHours = entries.reduce((total, entry) => {
    const [startHours, startMinutes] = entry.startTime.split(':').map(Number);
    const [endHours, endMinutes] = entry.endTime.split(':').map(Number);
    let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (minutes < 0) minutes += 24 * 60;
    return total + minutes;
  }, 0);

  const hoursDisplay = `${Math.floor(totalHours / 60)}h ${totalHours % 60}m`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Date Navigation */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Date Picker */}
            <div className="flex items-center justify-center sm:justify-start">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Previous day"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center mx-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {formatDateForDisplay(selectedDate)}
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 text-sm text-blue-600 border-none bg-transparent cursor-pointer hover:text-blue-700 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Next day"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Today Button and Total */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total</div>
                <div className="text-lg sm:text-xl font-bold text-blue-700">
                  {hoursDisplay}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Entry Form */}
        <div className="mb-6">
          <TimeEntryForm
            activities={activities}
            onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
            onCancel={editingEntry ? () => setEditingEntry(null) : undefined}
            editingEntry={editingEntry}
          />
        </div>

        {/* Time Entries List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No time entries</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by logging your time above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <TimeEntry
                key={entry.id}
                entry={entry}
                activities={activities}
                onEdit={setEditingEntry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
