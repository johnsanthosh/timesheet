// Mock firebase/auth
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const getAuth = jest.fn(() => ({}));
export const onAuthStateChanged = jest.fn();
export type User = {
  uid: string;
  email: string | null;
};
