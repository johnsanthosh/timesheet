// Mock firebase/firestore
export const collection = jest.fn(() => 'mock-collection');
export const doc = jest.fn((_, __, id) => ({ id }));
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const getDoc = jest.fn();
export const addDoc = jest.fn();
export const setDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const query = jest.fn((col) => col);
export const where = jest.fn();
export const orderBy = jest.fn(() => 'mock-order');
export const serverTimestamp = jest.fn(() => 'mock-timestamp');
export const Timestamp = {
  fromDate: jest.fn((date) => ({ toDate: () => date })),
  now: jest.fn(() => ({ toDate: () => new Date() })),
};
