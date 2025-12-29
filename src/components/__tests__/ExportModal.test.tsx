import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportModal } from '../ExportModal';
import type { AppUser, Activity } from '../../types';

describe('ExportModal component', () => {
  const mockUsers: Record<string, AppUser> = {
    user1: {
      uid: 'user1',
      email: 'john@example.com',
      displayName: 'John Doe',
      role: 'user',
      createdAt: new Date('2024-01-01'),
    },
    user2: {
      uid: 'user2',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
    },
  };

  const mockActivities: Activity[] = [
    { id: 'meeting', label: 'Meeting', color: '#10B981' },
    { id: 'development', label: 'Development', color: '#3B82F6' },
    { id: 'testing', label: 'Testing', color: '#F59E0B' },
  ];

  const mockOnClose = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnExport.mockResolvedValue(undefined);
  });

  it('renders when isOpen is true', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        users={mockUsers}
        activities={mockActivities}
        onExport={mockOnExport}
        isExporting={false}
        exportError={null}
      />
    );

    expect(screen.getByText('Export Timesheet')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ExportModal
        isOpen={false}
        onClose={mockOnClose}
        users={mockUsers}
        activities={mockActivities}
        onExport={mockOnExport}
        isExporting={false}
        exportError={null}
      />
    );

    expect(screen.queryByText('Export Timesheet')).not.toBeInTheDocument();
  });

  describe('user filtering', () => {
    it('displays all users in the filter list', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('allows selecting individual users', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input[type="checkbox"]');
      expect(johnCheckbox).not.toBeChecked();

      fireEvent.click(johnCheckbox!);
      expect(johnCheckbox).toBeChecked();
    });

    it('allows selecting all users', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      const selectAllButtons = screen.getAllByText('Select All');
      fireEvent.click(selectAllButtons[0]); // First Select All is for users

      const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input[type="checkbox"]');
      const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input[type="checkbox"]');

      expect(johnCheckbox).toBeChecked();
      expect(janeCheckbox).toBeChecked();
    });

    it('allows clearing all user selections', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // First select all users
      const selectAllButtons = screen.getAllByText('Select All');
      fireEvent.click(selectAllButtons[0]);

      // Then clear
      const clearButtons = screen.getAllByText('Clear');
      fireEvent.click(clearButtons[0]);

      const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input[type="checkbox"]');
      const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input[type="checkbox"]');

      expect(johnCheckbox).not.toBeChecked();
      expect(janeCheckbox).not.toBeChecked();
    });
  });

  describe('activity filtering', () => {
    it('displays all activities in the filter list', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByText('Meeting')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });

    it('allows selecting individual activities', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      const meetingCheckbox = screen.getByText('Meeting').closest('label')?.querySelector('input[type="checkbox"]');
      expect(meetingCheckbox).not.toBeChecked();

      fireEvent.click(meetingCheckbox!);
      expect(meetingCheckbox).toBeChecked();
    });

    it('allows selecting all activities', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      const selectAllButtons = screen.getAllByText('Select All');
      fireEvent.click(selectAllButtons[1]); // Second Select All is for activities

      const meetingCheckbox = screen.getByText('Meeting').closest('label')?.querySelector('input[type="checkbox"]');
      const devCheckbox = screen.getByText('Development').closest('label')?.querySelector('input[type="checkbox"]');
      const testCheckbox = screen.getByText('Testing').closest('label')?.querySelector('input[type="checkbox"]');

      expect(meetingCheckbox).toBeChecked();
      expect(devCheckbox).toBeChecked();
      expect(testCheckbox).toBeChecked();
    });

    it('allows clearing all activity selections', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // First select all activities
      const selectAllButtons = screen.getAllByText('Select All');
      fireEvent.click(selectAllButtons[1]);

      // Then clear
      const clearButtons = screen.getAllByText('Clear');
      fireEvent.click(clearButtons[1]);

      const meetingCheckbox = screen.getByText('Meeting').closest('label')?.querySelector('input[type="checkbox"]');
      expect(meetingCheckbox).not.toBeChecked();
    });
  });

  describe('export submission', () => {
    it('submits with selected user filters', async () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // Select one user
      const johnCheckbox = screen.getByText('John Doe').closest('label')?.querySelector('input[type="checkbox"]');
      fireEvent.click(johnCheckbox!);

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedUserIds: ['user1'],
          }),
          mockUsers,
          mockActivities
        );
      });
    });

    it('submits with selected activity filters', async () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // Select one activity
      const meetingCheckbox = screen.getByText('Meeting').closest('label')?.querySelector('input[type="checkbox"]');
      fireEvent.click(meetingCheckbox!);

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedActivityIds: ['meeting'],
          }),
          mockUsers,
          mockActivities
        );
      });
    });

    it('submits with both user and activity filters', async () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // Select user
      const janeCheckbox = screen.getByText('Jane Smith').closest('label')?.querySelector('input[type="checkbox"]');
      fireEvent.click(janeCheckbox!);

      // Select activities
      const devCheckbox = screen.getByText('Development').closest('label')?.querySelector('input[type="checkbox"]');
      const testCheckbox = screen.getByText('Testing').closest('label')?.querySelector('input[type="checkbox"]');
      fireEvent.click(devCheckbox!);
      fireEvent.click(testCheckbox!);

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedUserIds: ['user2'],
            selectedActivityIds: ['development', 'testing'],
          }),
          mockUsers,
          mockActivities
        );
      });
    });

    it('submits without filters when none selected', async () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      // Submit without selecting any filters
      fireEvent.click(screen.getByRole('button', { name: /export/i }));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedUserIds: undefined,
            selectedActivityIds: undefined,
          }),
          mockUsers,
          mockActivities
        );
      });
    });
  });

  describe('UI states', () => {
    it('shows loading state when exporting', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={true}
          exportError={null}
        />
      );

      expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled();
    });

    it('shows error message when export fails', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError="No time entries found"
        />
      );

      expect(screen.getByText('No time entries found')).toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('shows hint text for optional filters', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByText('Leave empty to include all users')).toBeInTheDocument();
      expect(screen.getByText('Leave empty to include all activities')).toBeInTheDocument();
    });
  });

  describe('date range quick select', () => {
    it('has quick select buttons for date ranges', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'This Week' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'This Month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last Month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last 30 Days' })).toBeInTheDocument();
    });
  });

  describe('export format and type', () => {
    it('has PDF and CSV format options', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('has Detailed and Summary report type options', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          users={mockUsers}
          activities={mockActivities}
          onExport={mockOnExport}
          isExporting={false}
          exportError={null}
        />
      );

      expect(screen.getByText('Detailed')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
  });
});
