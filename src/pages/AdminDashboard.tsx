import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Header } from '../components/Header';
import { TimeEntry } from '../components/TimeEntry';
import { TimeEntryForm } from '../components/TimeEntryForm';
import { ExportModal } from '../components/ExportModal';
import { getAllTimeEntries, updateTimeEntry, deleteTimeEntry } from '../services/timesheet';
import { getActivities } from '../services/activities';
import {
  getCurrentLocalDate,
  formatDateForDisplay,
  getTimezoneName,
} from '../utils/timezone';
import { useExport } from '../hooks/useExport';
import type { TimeEntry as TimeEntryType, AppUser, Activity } from '../types';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [entries, setEntries] = useState<TimeEntryType[]>([]);
  const [users, setUsers] = useState<Record<string, AppUser>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentLocalDate());
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryType | null>(null);
  const { isExporting, exportError, exportData } = useExport();

  useEffect(() => {
    loadUsers();
    loadActivities();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedDate]);

  const loadActivities = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersMap: Record<string, AppUser> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        usersMap[doc.id] = {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getAllTimeEntries(selectedDate);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
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

  const handleUpdateEntry = async (data: {
    activity: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    if (!editingEntry) return;

    try {
      await updateTimeEntry(editingEntry.id, editingEntry.date, data);
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

  const filteredEntries =
    selectedUser === 'all'
      ? entries
      : entries.filter((e) => e.userId === selectedUser);

  // Calculate summary by user
  const summaryByUser = entries.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = { totalMinutes: 0, entries: 0 };
    }
    const [startHours, startMinutes] = entry.startTime.split(':').map(Number);
    const [endHours, endMinutes] = entry.endTime.split(':').map(Number);
    let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (minutes < 0) minutes += 24 * 60;
    acc[entry.userId].totalMinutes += minutes;
    acc[entry.userId].entries += 1;
    return acc;
  }, {} as Record<string, { totalMinutes: number; entries: number }>);

  // Calculate total hours
  const totalMinutes = Object.values(summaryByUser).reduce((sum, s) => sum + s.totalMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Controls Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col gap-4">
            {/* Date Navigation Row */}
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

              {/* Total Hours Badge */}
              <div className="hidden sm:block text-right bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total</div>
                <div className="text-xl font-bold text-blue-700">
                  {totalHours}h {totalMins}m
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 sm:flex-none sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Users</option>
                  {Object.values(users).map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName || user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Export Data"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Total */}
            <div className="sm:hidden text-center bg-blue-50 px-4 py-2 rounded-lg">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Hours</div>
              <div className="text-xl font-bold text-blue-700">
                {totalHours}h {totalMins}m
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Timezone
              </label>
              <p className="text-sm text-gray-600">{getTimezoneName()}</p>
              <p className="text-xs text-gray-400 mt-1">
                Times are stored in UTC and displayed in your browser's timezone.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {Object.keys(summaryByUser).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {Object.entries(summaryByUser).map(([userId, summary]) => {
              const user = users[userId];
              const hours = Math.floor(summary.totalMinutes / 60);
              const minutes = summary.totalMinutes % 60;
              const isSelected = selectedUser === userId;
              return (
                <button
                  key={userId}
                  onClick={() => setSelectedUser(isSelected ? 'all' : userId)}
                  className={`text-left bg-white rounded-xl shadow-sm border p-3 sm:p-4 transition-all hover:shadow-md ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'
                  }`}
                >
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    {user?.displayName || user?.email || 'Unknown User'}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {hours}h {minutes}m
                  </div>
                  <div className="text-xs text-gray-400">
                    {summary.entries} {summary.entries === 1 ? 'entry' : 'entries'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Edit Entry Modal */}
        {editingEntry && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Editing entry for: <span className="font-medium text-gray-700">{users[editingEntry.userId]?.displayName || users[editingEntry.userId]?.email}</span>
              </span>
            </div>
            <TimeEntryForm
              activities={activities}
              onSubmit={handleUpdateEntry}
              onCancel={() => setEditingEntry(null)}
              editingEntry={editingEntry}
            />
          </div>
        )}

        {/* Time Entries List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No time entries</h3>
            <p className="mt-1 text-sm text-gray-500">No entries found for this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <TimeEntry
                key={entry.id}
                entry={entry}
                activities={activities}
                onEdit={setEditingEntry}
                onDelete={handleDeleteEntry}
                showUser={selectedUser === 'all'}
                userName={users[entry.userId]?.displayName || users[entry.userId]?.email}
              />
            ))}
          </div>
        )}
      </main>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        users={users}
        activities={activities}
        onExport={exportData}
        isExporting={isExporting}
        exportError={exportError}
      />
    </div>
  );
}
