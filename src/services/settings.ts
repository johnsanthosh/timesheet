import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AppSettings {
  allowUserEdits: boolean;
  updatedAt?: Date;
  updatedBy?: string;
}

const SETTINGS_DOC = 'appConfig';
const COLLECTION = 'settings';

const DEFAULT_SETTINGS: AppSettings = {
  allowUserEdits: true,
};

export async function getSettings(): Promise<AppSettings> {
  const docRef = doc(db, COLLECTION, SETTINGS_DOC);

  try {
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Return default settings if document doesn't exist
      // Don't try to create it here - let admin do it via updateSettings
      return DEFAULT_SETTINGS;
    }

    const data = snapshot.data();
    return {
      allowUserEdits: data.allowUserEdits ?? true,
      updatedAt: data.updatedAt?.toDate(),
      updatedBy: data.updatedBy,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults on error
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  settings: Partial<AppSettings>,
  updatedByUid: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, SETTINGS_DOC);

  await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: updatedByUid,
  }, { merge: true });
}
