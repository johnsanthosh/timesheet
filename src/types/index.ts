export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  createdBy?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  activity: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  label: string;
  color: string;
}

export interface ActivitiesConfig {
  activities: Activity[];
}

export interface AppConfig {
  timezone: string;
}
