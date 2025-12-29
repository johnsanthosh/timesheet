import { signIn, signOut, getUserData, updateUser, deleteUser } from '../auth';
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

// Get mock functions from the mock modules
const mockSignInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword as jest.Mock;
const mockFirebaseSignOut = firebaseAuth.signOut as jest.Mock;
const mockGetDoc = firestore.getDoc as jest.Mock;
const mockUpdateDoc = firestore.updateDoc as jest.Mock;
const mockDeleteDoc = firestore.deleteDoc as jest.Mock;

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
    it('deletes user document from Firestore', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await deleteUser('user123');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user123' })
      );
    });
  });
});
