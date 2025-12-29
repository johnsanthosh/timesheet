import { signIn, signOut, getUserData, updateUser, deleteUser } from '../auth';
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

// Get mock functions from the mock modules
const mockSignInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword as jest.Mock;
const mockFirebaseSignOut = firebaseAuth.signOut as jest.Mock;
const mockGetDoc = firestore.getDoc as jest.Mock;
const mockUpdateDoc = firestore.updateDoc as jest.Mock;
const mockGetDocs = firestore.getDocs as jest.Mock;
const mockWriteBatch = firestore.writeBatch as jest.Mock;

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('signs in user with email and password', async () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const result = await signIn('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
    });

    it('throws error on invalid credentials', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('signs out the current user', async () => {
      mockFirebaseSignOut.mockResolvedValueOnce(undefined);

      await signOut();

      expect(mockFirebaseSignOut).toHaveBeenCalled();
    });
  });

  describe('getUserData', () => {
    it('returns user data from Firestore', async () => {
      const mockTimestamp = { toDate: () => new Date('2024-01-01') };
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'user',
          createdAt: mockTimestamp,
          createdBy: 'admin123',
        }),
      });

      const result = await getUserData('user123');

      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin123',
      });
    });

    it('returns null when user does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getUserData('nonexistent');

      expect(result).toBeNull();
    });

    it('handles missing createdAt field', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'user',
          createdAt: null,
        }),
      });

      const result = await getUserData('user123');

      expect(result?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('updateUser', () => {
    it('updates user with displayName', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateUser('user123', { displayName: 'New Name' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user123' }),
        expect.objectContaining({
          displayName: 'New Name',
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('updates user with role', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateUser('user123', { role: 'admin' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user123' }),
        expect.objectContaining({
          role: 'admin',
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('updates both displayName and role', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateUser('user123', { displayName: 'New Name', role: 'admin' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user123' }),
        expect.objectContaining({
          displayName: 'New Name',
          role: 'admin',
          updatedAt: 'mock-timestamp',
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('deletes user and their time entries using batch', async () => {
      const mockBatchDelete = jest.fn();
      const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
      mockWriteBatch.mockReturnValue({
        delete: mockBatchDelete,
        commit: mockBatchCommit,
      });

      // Mock time entries for the user
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { ref: { id: 'entry1' } },
          { ref: { id: 'entry2' } },
        ],
      });

      await deleteUser('user123');

      // Should have called writeBatch
      expect(mockWriteBatch).toHaveBeenCalled();

      // Should delete time entries (2) + user doc (1) = 3 deletes
      expect(mockBatchDelete).toHaveBeenCalledTimes(3);

      // Should commit the batch
      expect(mockBatchCommit).toHaveBeenCalled();
    });

    it('deletes user even with no time entries', async () => {
      const mockBatchDelete = jest.fn();
      const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
      mockWriteBatch.mockReturnValue({
        delete: mockBatchDelete,
        commit: mockBatchCommit,
      });

      // No time entries
      mockGetDocs.mockResolvedValueOnce({ docs: [] });

      await deleteUser('user123');

      // Should only delete the user doc
      expect(mockBatchDelete).toHaveBeenCalledTimes(1);
      expect(mockBatchCommit).toHaveBeenCalled();
    });
  });
});
