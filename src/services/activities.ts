import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Activity } from '../types';

const COLLECTION = 'activities';

// Default activity to seed if none exist
const DEFAULT_ACTIVITY: Omit<Activity, 'id'> = {
  label: 'Meeting',
  color: '#10B981',
};

export async function getActivities(): Promise<Activity[]> {
  const q = query(collection(db, COLLECTION), orderBy('label'));
  const snapshot = await getDocs(q);

  const activities = snapshot.docs.map((doc) => ({
    id: doc.id,
    label: doc.data().label as string,
    color: doc.data().color as string,
  }));

  // If no activities exist, create the default one
  if (activities.length === 0) {
    const defaultActivity = await createActivity(DEFAULT_ACTIVITY.label, DEFAULT_ACTIVITY.color);
    return [defaultActivity];
  }

  return activities;
}

export async function createActivity(label: string, color: string): Promise<Activity> {
  const id = label.toLowerCase().replace(/\s+/g, '-');

  await setDoc(doc(db, COLLECTION, id), {
    label,
    color,
    createdAt: serverTimestamp(),
  });

  return { id, label, color };
}

export async function updateActivity(
  id: string,
  data: { label?: string; color?: string }
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.label !== undefined) {
    updateData.label = data.label;
  }
  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  await updateDoc(doc(db, COLLECTION, id), updateData);
}

export async function deleteActivity(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
