import { getActivities, createActivity, updateActivity, deleteActivity } from '../activities';
import * as firestore from 'firebase/firestore';

// Get mock functions from the mock module
const mockSetDoc = firestore.setDoc as jest.Mock;
const mockUpdateDoc = firestore.updateDoc as jest.Mock;
const mockDeleteDoc = firestore.deleteDoc as jest.Mock;
const mockGetDocs = firestore.getDocs as jest.Mock;

// Mock docs storage
const mockDocs: { id: string; data: () => Record<string, unknown> }[] = [];

describe('activities service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock for getDocs
    mockGetDocs.mockResolvedValue({ docs: mockDocs });
    mockDocs.length = 0;
  });

  describe('getActivities', () => {
    it('returns activities from Firestore', async () => {
      mockDocs.push(
        { id: 'meeting', data: () => ({ label: 'Meeting', color: '#10B981' }) },
        { id: 'development', data: () => ({ label: 'Development', color: '#3B82F6' }) }
      );

      const activities = await getActivities();

      expect(activities).toHaveLength(2);
      expect(activities[0]).toEqual({ id: 'meeting', label: 'Meeting', color: '#10B981' });
      expect(activities[1]).toEqual({ id: 'development', label: 'Development', color: '#3B82F6' });
    });

    it('creates default activity when none exist', async () => {
      // Empty docs initially
      mockDocs.length = 0;

      // Mock that after creating, it returns the new activity
      mockSetDoc.mockResolvedValueOnce(undefined);

      const activities = await getActivities();

      expect(mockSetDoc).toHaveBeenCalled();
      expect(activities).toHaveLength(1);
      expect(activities[0]).toEqual({
        id: 'meeting',
        label: 'Meeting',
        color: '#10B981',
      });
    });
  });

  describe('createActivity', () => {
    it('creates activity with correct ID format', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const activity = await createActivity('Team Meeting', '#FF0000');

      expect(activity.id).toBe('team-meeting');
      expect(activity.label).toBe('Team Meeting');
      expect(activity.color).toBe('#FF0000');
      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('updateActivity', () => {
    it('updates activity with provided data', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateActivity('meeting', { label: 'New Label', color: '#0000FF' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'meeting' }),
        expect.objectContaining({
          label: 'New Label',
          color: '#0000FF',
          updatedAt: 'mock-timestamp',
        })
      );
    });

    it('only updates provided fields', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateActivity('meeting', { label: 'New Label' });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'meeting' }),
        expect.objectContaining({
          label: 'New Label',
          updatedAt: 'mock-timestamp',
        })
      );
    });
  });

  describe('deleteActivity', () => {
    it('deletes activity', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await deleteActivity('meeting');

      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'meeting' })
      );
    });
  });
});
