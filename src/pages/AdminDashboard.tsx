import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Header } from '../components/Header';
import { TimeEntry } from '../components/TimeEntry';
import { getAllTimeEntries } from '../services/timesheet';
import {
  getCurrentLocalDate,
  formatDateForDisplay,
  getTimezoneName,
} from '../utils/timezone';
import activitiesConfig from '../config/activities.json';
import type { TimeEntry as TimeEntryType, AppUser } from '../types';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [entries, setEntries] = useState<TimeEntryType[]>([]);
  const [users, setUsers] = useState<Record<string, AppUser>>({});
  const [selectedDate, setSelectedDate] = useState(getCurrentLocalDate());
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedDate]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleDateChange('prev')}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {formatDateForDisplay(selectedDate)}
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 text-sm text-gray-500 border-none bg-transparent cursor-pointer"
              />
            </div>
            <button
              onClick={() => handleDateChange('next')}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Today
            </button>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Users</option>
              {Object.values(users).map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.displayName || user.email}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-md hover:bg-gray-200"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Timezone
              </label>
              <p className="text-sm text-gray-600">
                {getTimezoneName()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Times are stored in UTC and displayed in your browser's timezone.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(summaryByUser).map(([userId, summary]) => {
            const user = users[userId];
            const hours = Math.floor(summary.totalMinutes / 60);
            const minutes = summary.totalMinutes % 60;
            return (
              <div
                key={userId}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                onClick={() => setSelectedUser(userId)}
              >
                <div className="text-sm text-gray-500">
                  {user?.displayName || user?.email || 'Unknown User'}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {hours}h {minutes}m
                </div>
                <div className="text-xs text-gray-400">
                  {summary.entries} entries
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No time entries for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-2 top-4 text-xs text-gray-400">
                  {users[entry.userId]?.displayName ||
                    users[entry.userId]?.email ||
                    'Unknown'}
                </div>
                <div className="ml-24">
                  <TimeEntry
                    entry={entry}
                    activities={activitiesConfig.activities}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
