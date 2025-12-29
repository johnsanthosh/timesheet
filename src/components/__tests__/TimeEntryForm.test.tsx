import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeEntryForm } from '../TimeEntryForm';
import type { TimeEntry, Activity } from '../../types';

describe('TimeEntryForm component', () => {
  const mockActivities: Activity[] = [
    { id: 'meeting', label: 'Meeting', color: '#10B981' },
    { id: 'development', label: 'Development', color: '#3B82F6' },
  ];

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders form with correct title for new entry', () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    // Title and button both have "Log Time" text
    expect(screen.getAllByText('Log Time').length).toBe(2);
    expect(screen.getByRole('button', { name: /log time/i })).toBeInTheDocument();
  });

  it('renders form with correct title for editing', () => {
    const editingEntry: TimeEntry = {
      id: 'entry1',
      userId: 'user1',
      date: '2024-01-15',
      activity: 'meeting',
      startTime: '09:00',
      endTime: '10:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
        editingEntry={editingEntry}
      />
    );

    expect(screen.getByText('Edit Time Entry')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update entry/i })).toBeInTheDocument();
  });

  it('renders all activity options', () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Select an activity')).toBeInTheDocument();
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    // Select activity
    await user.selectOptions(screen.getByRole('combobox'), 'meeting');

    // Set start time to a fixed value
    const startTimeInput = screen.getByLabelText(/start time/i);
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });

    // Set end time
    const endTimeInput = screen.getByLabelText(/end time/i);
    fireEvent.change(endTimeInput, { target: { value: '10:30' } });

    // Add notes
    const notesInput = screen.getByLabelText(/notes/i);
    await user.type(notesInput, 'Test notes');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log time/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        activity: 'meeting',
        startTime: '09:00',
        endTime: '10:30',
        notes: 'Test notes',
      });
    });
  });

  it('does not submit when required fields are empty', async () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    // Try to submit without selecting activity or end time
    fireEvent.click(screen.getByRole('button', { name: /log time/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('populates form with editing entry data', () => {
    const editingEntry: TimeEntry = {
      id: 'entry1',
      userId: 'user1',
      date: '2024-01-15',
      activity: 'development',
      startTime: '14:00',
      endTime: '16:00',
      notes: 'Working on feature',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
        editingEntry={editingEntry}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('development');
    expect(screen.getByLabelText(/start time/i)).toHaveValue('14:00');
    expect(screen.getByLabelText(/end time/i)).toHaveValue('16:00');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Working on feature');
  });

  it('shows loading state when submitting', async () => {
    let resolveSubmit: (value?: unknown) => void;
    mockOnSubmit.mockImplementation(() => new Promise((resolve) => {
      resolveSubmit = resolve;
    }));

    const user = userEvent.setup();

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill form
    await user.selectOptions(screen.getByRole('combobox'), 'meeting');
    const endTimeInput = screen.getByLabelText(/end time/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:00');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log time/i }));

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    // Resolve and verify it goes back to normal
    resolveSubmit!();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log time/i })).not.toBeDisabled();
    });
  });

  it('sets current time when "Now" button is clicked for start time', async () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    const nowButtons = screen.getAllByRole('button', { name: /now/i });
    const startTimeInput = screen.getByLabelText(/start time/i);

    // Click Now button
    fireEvent.click(nowButtons[0]);

    // Should have a valid time format (HH:mm)
    expect(startTimeInput.getAttribute('value')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('sets current time when "Now" button is clicked for end time', async () => {
    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    const nowButtons = screen.getAllByRole('button', { name: /now/i });
    const endTimeInput = screen.getByLabelText(/end time/i);

    fireEvent.click(nowButtons[1]);

    // Should have a valid time format (HH:mm)
    expect(endTimeInput.getAttribute('value')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('clears form after successful submit for new entry', async () => {
    const user = userEvent.setup();

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill form
    await user.selectOptions(screen.getByRole('combobox'), 'meeting');
    const endTimeInput = screen.getByLabelText(/end time/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:00');
    await user.type(screen.getByLabelText(/notes/i), 'Test');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /log time/i }));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('');
    });
  });

  it('does not clear form after successful submit when editing', async () => {
    const user = userEvent.setup();
    const editingEntry: TimeEntry = {
      id: 'entry1',
      userId: 'user1',
      date: '2024-01-15',
      activity: 'meeting',
      startTime: '09:00',
      endTime: '10:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TimeEntryForm
        activities={mockActivities}
        onSubmit={mockOnSubmit}
        editingEntry={editingEntry}
      />
    );

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /update entry/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Form should retain values
    expect(screen.getByRole('combobox')).toHaveValue('meeting');
  });
});
