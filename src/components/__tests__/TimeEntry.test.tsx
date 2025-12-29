import { render, screen, fireEvent } from '@testing-library/react';
import { TimeEntry } from '../TimeEntry';
import type { TimeEntry as TimeEntryType, Activity } from '../../types';

describe('TimeEntry component', () => {
  const mockActivities: Activity[] = [
    { id: 'meeting', label: 'Meeting', color: '#10B981' },
    { id: 'development', label: 'Development', color: '#3B82F6' },
  ];

  const mockEntry: TimeEntryType = {
    id: 'entry1',
    userId: 'user1',
    date: '2024-01-15',
    activity: 'meeting',
    startTime: '09:00',
    endTime: '10:30',
    notes: 'Team standup meeting',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders activity label correctly', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Meeting')).toBeInTheDocument();
  });

  it('renders time range correctly', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('9:00 AM - 10:30 AM')).toBeInTheDocument();
  });

  it('renders duration correctly', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });

  it('renders notes when provided', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Team standup meeting')).toBeInTheDocument();
  });

  it('does not render notes section when notes is undefined', () => {
    const entryWithoutNotes = { ...mockEntry, notes: undefined };

    render(
      <TimeEntry
        entry={entryWithoutNotes}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Team standup meeting')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit entry/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEntry);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete entry/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockEntry.id);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('shows user name when showUser is true', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        showUser={true}
        userName="John Doe"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('does not show user name when showUser is false', () => {
    render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        showUser={false}
        userName="John Doe"
      />
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('falls back to activity ID when activity is not found', () => {
    const entryWithUnknownActivity = { ...mockEntry, activity: 'unknown-activity' };

    render(
      <TimeEntry
        entry={entryWithUnknownActivity}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('unknown-activity')).toBeInTheDocument();
  });

  it('applies activity color to the color bar', () => {
    const { container } = render(
      <TimeEntry
        entry={mockEntry}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const colorBar = container.querySelector('[style*="background-color"]');
    expect(colorBar).toHaveStyle({ backgroundColor: '#10B981' });
  });

  it('uses default gray color when activity is not found', () => {
    const entryWithUnknownActivity = { ...mockEntry, activity: 'unknown' };

    const { container } = render(
      <TimeEntry
        entry={entryWithUnknownActivity}
        activities={mockActivities}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const colorBar = container.querySelector('[style*="background-color"]');
    expect(colorBar).toHaveStyle({ backgroundColor: '#6B7280' });
  });
});
