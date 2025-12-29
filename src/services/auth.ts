import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  getAuth,
  type User,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from './firebase';
import type { AppUser, UserRole } from '../types';

export async function signIn(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserData(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    return null;
  }
  const data = userDoc.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role as UserRole,
    createdAt: data.createdAt?.toDate() || new Date(),
    createdBy: data.createdBy,
  };
}

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  createdByUid: string
): Promise<AppUser> {
  // Use a secondary app instance to create user without affecting current session
  const secondaryApp = initializeApp(firebaseConfig, 'secondary');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // Create Firebase Auth user using secondary app
    const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = result.user.uid;

    // Sign out from secondary app immediately
    await firebaseSignOut(secondaryAuth);

    // Create user document in Firestore (using main app's db, admin is still signed in)
    const userData = {
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      createdBy: createdByUid,
    };

    await setDoc(doc(db, 'users', uid), userData);

    return {
      uid,
      email,
      displayName,
      role,
      createdAt: new Date(),
      createdBy: createdByUid,
    };
  } finally {
    // Clean up secondary app
    await deleteApp(secondaryApp);
  }
}

export async function updateUser(
  uid: string,
  data: { displayName?: string; role?: UserRole }
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName;
  }
  if (data.role !== undefined) {
    updateData.role = data.role;
  }

  await updateDoc(doc(db, 'users', uid), updateData);
}

export async function deleteUser(uid: string): Promise<void> {
  // Delete all time entries for this user first (cascade delete)
  const entriesQuery = query(
    collection(db, 'timeEntries'),
    where('userId', '==', uid)
  );
  const entriesSnapshot = await getDocs(entriesQuery);

  // Use batch delete for efficiency (Firestore allows up to 500 operations per batch)
  const batch = writeBatch(db);
  entriesSnapshot.docs.forEach((entryDoc) => {
    batch.delete(entryDoc.ref);
  });

  // Delete the user document
  batch.delete(doc(db, 'users', uid));

  // Commit all deletions
  await batch.commit();

  // Note: Firebase Auth user deletion requires admin SDK (server-side)
}
