import {
  transformToDetailedRows,
  transformToSummaryRows,
  formatMinutesToHours,
} from '../dataTransformer';
import type { TimeEntry, AppUser, Activity } from '../../../types';

describe('dataTransformer', () => {
  const mockUsers: Record<string, AppUser> = {
    user1: {
      uid: 'user1',
      email: 'john@example.com',
      displayName: 'John Doe',
      role: 'user',
      createdAt: new Date('2024-01-01'),
    },
    user2: {
      uid: 'user2',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
    },
  };

  const mockActivities: Activity[] = [
    { id: 'meeting', label: 'Meeting', color: '#10B981' },
    { id: 'development', label: 'Development', color: '#3B82F6' },
  ];

  const mockEntries: TimeEntry[] = [
    {
      id: 'entry1',
      userId: 'user1',
      date: '2024-01-15',
      activity: 'meeting',
      startTime: '09:00',
      endTime: '10:30',
      notes: 'Team standup',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'entry2',
      userId: 'user1',
      date: '2024-01-15',
      activity: 'development',
      startTime: '10:30',
      endTime: '12:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'entry3',
      userId: 'user2',
      date: '2024-01-15',
      activity: 'meeting',
      startTime: '14:00',
      endTime: '15:00',
      notes: 'Client call',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('transformToDetailedRows', () => {
    it('transforms entries to detailed rows correctly', () => {
      const rows = transformToDetailedRows(mockEntries, mockUsers, mockActivities);

      expect(rows).toHaveLength(3);
      expect(rows[0].userName).toBe('Jane Smith');
      expect(rows[0].activity).toBe('Meeting');
      expect(rows[0].startTime).toBe('2:00 PM');
      expect(rows[0].endTime).toBe('3:00 PM');
      expect(rows[0].duration).toBe('1h');
      expect(rows[0].durationMinutes).toBe(60);
      expect(rows[0].notes).toBe('Client call');
    });

    it('sorts entries by date, then user, then start time', () => {
      const rows = transformToDetailedRows(mockEntries, mockUsers, mockActivities);

      // Jane comes before John alphabetically
      expect(rows[0].userName).toBe('Jane Smith');
      expect(rows[1].userName).toBe('John Doe');
      expect(rows[2].userName).toBe('John Doe');
    });

    it('handles unknown users', () => {
      const entriesWithUnknown: TimeEntry[] = [
        {
          id: 'entry1',
          userId: 'unknown',
          date: '2024-01-15',
          activity: 'meeting',
          startTime: '09:00',
          endTime: '10:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rows = transformToDetailedRows(entriesWithUnknown, mockUsers, mockActivities);
      expect(rows[0].userName).toBe('Unknown User');
    });

    it('handles unknown activities', () => {
      const entriesWithUnknown: TimeEntry[] = [
        {
          id: 'entry1',
          userId: 'user1',
          date: '2024-01-15',
          activity: 'unknown-activity',
          startTime: '09:00',
          endTime: '10:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rows = transformToDetailedRows(entriesWithUnknown, mockUsers, mockActivities);
      expect(rows[0].activity).toBe('unknown-activity');
    });

    it('handles missing notes', () => {
      const rows = transformToDetailedRows(mockEntries, mockUsers, mockActivities);
      const entryWithoutNotes = rows.find(r => r.startTime === '10:30 AM');
      expect(entryWithoutNotes?.notes).toBe('');
    });

    it('shows "In Progress" for entries without endTime', () => {
      const inProgressEntry: TimeEntry[] = [
        {
          id: 'entry1',
          userId: 'user1',
          date: '2024-01-15',
          activity: 'meeting',
          startTime: '09:00',
          endTime: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rows = transformToDetailedRows(inProgressEntry, mockUsers, mockActivities);
      expect(rows[0].endTime).toBe('In Progress');
      expect(rows[0].duration).toBe('In Progress');
      expect(rows[0].durationMinutes).toBe(0);
    });
  });

  describe('transformToSummaryRows', () => {
    it('aggregates entries by user and date', () => {
      const rows = transformToSummaryRows(mockEntries, mockUsers, mockActivities);

      expect(rows).toHaveLength(2); // Two unique user-date combinations

      const janeRow = rows.find(r => r.userName === 'Jane Smith');
      const johnRow = rows.find(r => r.userName === 'John Doe');

      expect(janeRow?.totalMinutes).toBe(60);
      expect(janeRow?.entryCount).toBe(1);

      expect(johnRow?.totalMinutes).toBe(180); // 90 + 90 minutes
      expect(johnRow?.entryCount).toBe(2);
    });

    it('calculates activity breakdown', () => {
      const rows = transformToSummaryRows(mockEntries, mockUsers, mockActivities);

      const johnRow = rows.find(r => r.userName === 'John Doe');
      expect(johnRow?.activityBreakdown['Meeting']).toBe(90);
      expect(johnRow?.activityBreakdown['Development']).toBe(90);
    });

    it('formats total hours correctly', () => {
      const rows = transformToSummaryRows(mockEntries, mockUsers, mockActivities);

      const johnRow = rows.find(r => r.userName === 'John Doe');
      expect(johnRow?.totalHours).toBe('3h');
    });

    it('sorts by username then date', () => {
      const rows = transformToSummaryRows(mockEntries, mockUsers, mockActivities);

      expect(rows[0].userName).toBe('Jane Smith');
      expect(rows[1].userName).toBe('John Doe');
    });
  });

  describe('formatMinutesToHours', () => {
    it('formats minutes only', () => {
      expect(formatMinutesToHours(30)).toBe('30m');
      expect(formatMinutesToHours(45)).toBe('45m');
    });

    it('formats hours only', () => {
      expect(formatMinutesToHours(60)).toBe('1h');
      expect(formatMinutesToHours(120)).toBe('2h');
    });

    it('formats hours and minutes', () => {
      expect(formatMinutesToHours(90)).toBe('1h 30m');
      expect(formatMinutesToHours(150)).toBe('2h 30m');
    });

    it('handles zero', () => {
      expect(formatMinutesToHours(0)).toBe('0m');
    });
  });
});
