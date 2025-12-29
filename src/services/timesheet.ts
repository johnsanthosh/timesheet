import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { TimeEntry } from '../types';
import { localTimeToUTC, utcTimeToLocal } from '../utils/timezone';

const COLLECTION = 'timeEntries';

function convertTimestamp(timestamp: Timestamp | null): Date {
  return timestamp?.toDate() || new Date();
}

function parseEntry(doc: { id: string; data: () => Record<string, unknown> }): TimeEntry {
  const data = doc.data();
  const date = data.date as string;
  const startTimeUTC = data.startTime as string;
  const endTimeUTC = data.endTime as string;

  // Convert UTC times to local timezone for display
  return {
    id: doc.id,
    userId: data.userId as string,
    date,
    activity: data.activity as string,
    startTime: utcTimeToLocal(date, startTimeUTC),
    endTime: utcTimeToLocal(date, endTimeUTC),
    notes: data.notes as string | undefined,
    createdAt: convertTimestamp(data.createdAt as Timestamp | null),
    updatedAt: convertTimestamp(data.updatedAt as Timestamp | null),
  };
}

function sortByStartTime(entries: TimeEntry[], ascending = true): TimeEntry[] {
  return entries.sort((a, b) => {
    const comparison = a.startTime.localeCompare(b.startTime);
    return ascending ? comparison : -comparison;
  });
}

export async function createTimeEntry(
  userId: string,
  data: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<TimeEntry> {
  // Convert local times to UTC for storage
  const startTimeUTC = localTimeToUTC(data.date, data.startTime);
  const endTimeUTC = localTimeToUTC(data.date, data.endTime);

  // Remove undefined values (Firestore doesn't accept them)
  const cleanData: Record<string, unknown> = {
    userId,
    date: data.date,
    activity: data.activity,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Only add notes if it has a value
  if (data.notes) {
    cleanData.notes = data.notes;
  }

  const docRef = await addDoc(collection(db, COLLECTION), cleanData);

  // Return with local times for immediate display
  return {
    id: docRef.id,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateTimeEntry(
  entryId: string,
  date: string,
  data: Partial<Pick<TimeEntry, 'activity' | 'startTime' | 'endTime' | 'notes' | 'date'>>
): Promise<void> {
  // Remove undefined values (Firestore doesn't accept them)
  const cleanData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.activity !== undefined) cleanData.activity = data.activity;
  if (data.date !== undefined) cleanData.date = data.date;
  if (data.notes !== undefined) cleanData.notes = data.notes;

  // Convert local times to UTC for storage
  const dateForConversion = data.date || date;
  if (data.startTime !== undefined) {
    cleanData.startTime = localTimeToUTC(dateForConversion, data.startTime);
  }
  if (data.endTime !== undefined) {
    cleanData.endTime = localTimeToUTC(dateForConversion, data.endTime);
  }

  await updateDoc(doc(db, COLLECTION, entryId), cleanData);
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, entryId));
}

export async function getUserTimeEntries(
  userId: string,
  date?: string
): Promise<TimeEntry[]> {
  // Simple query without orderBy to avoid needing composite indexes
  let q;
  if (date) {
    q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('date', '==', date)
    );
  } else {
    q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );
  }

  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(parseEntry);

  // Sort client-side
  return sortByStartTime(entries, true);
}

export async function getAllTimeEntries(date?: string): Promise<TimeEntry[]> {
  // Simple query without orderBy to avoid needing composite indexes
  let q;
  if (date) {
    q = query(
      collection(db, COLLECTION),
      where('date', '==', date)
    );
  } else {
    q = query(collection(db, COLLECTION));
  }

  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(parseEntry);

  // Sort client-side
  return sortByStartTime(entries, true);
}

export async function getTimeEntriesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  // Simple query - filter and sort client-side
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const entries = snapshot.docs
    .map(parseEntry)
    .filter((entry) => entry.date >= startDate && entry.date <= endDate);

  // Sort client-side
  return entries.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function getAllTimeEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  // Fetch all entries without userId filter
  const q = query(collection(db, COLLECTION));

  const snapshot = await getDocs(q);
  const entries = snapshot.docs
    .map(parseEntry)
    .filter((entry) => entry.date >= startDate && entry.date <= endDate);

  // Sort by date, then by userId, then by startTime
  return entries.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    const userCompare = a.userId.localeCompare(b.userId);
    if (userCompare !== 0) return userCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}
