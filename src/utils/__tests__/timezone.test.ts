import {
  formatDateForDisplay,
  formatTimeForDisplay,
  calculateDuration,
  getTimezoneName,
} from '../timezone';

describe('timezone utility functions', () => {
  describe('formatDateForDisplay', () => {
    it('formats date correctly', () => {
      const result = formatDateForDisplay('2024-01-15');
      expect(result).toBe('Monday, January 15, 2024');
    });

    it('handles different dates', () => {
      expect(formatDateForDisplay('2024-12-25')).toBe('Wednesday, December 25, 2024');
      expect(formatDateForDisplay('2024-07-04')).toBe('Thursday, July 4, 2024');
    });
  });

  describe('formatTimeForDisplay', () => {
    it('formats AM times correctly', () => {
      expect(formatTimeForDisplay('09:30')).toBe('9:30 AM');
      expect(formatTimeForDisplay('00:00')).toBe('12:00 AM');
      expect(formatTimeForDisplay('11:59')).toBe('11:59 AM');
    });

    it('formats PM times correctly', () => {
      expect(formatTimeForDisplay('12:00')).toBe('12:00 PM');
      expect(formatTimeForDisplay('13:30')).toBe('1:30 PM');
      expect(formatTimeForDisplay('23:59')).toBe('11:59 PM');
    });

    it('handles single-digit minutes', () => {
      expect(formatTimeForDisplay('09:05')).toBe('9:05 AM');
      expect(formatTimeForDisplay('14:00')).toBe('2:00 PM');
    });
  });

  describe('calculateDuration', () => {
    it('calculates duration in hours and minutes', () => {
      expect(calculateDuration('09:00', '17:30')).toBe('8h 30m');
      expect(calculateDuration('08:00', '12:00')).toBe('4h');
      expect(calculateDuration('14:00', '14:45')).toBe('45m');
    });

    it('handles exact hours', () => {
      expect(calculateDuration('09:00', '12:00')).toBe('3h');
      expect(calculateDuration('00:00', '08:00')).toBe('8h');
    });

    it('handles minutes only', () => {
      expect(calculateDuration('09:00', '09:30')).toBe('30m');
      expect(calculateDuration('10:15', '10:45')).toBe('30m');
    });

    it('handles overnight duration', () => {
      expect(calculateDuration('22:00', '06:00')).toBe('8h');
      expect(calculateDuration('23:30', '00:30')).toBe('1h');
    });

    it('returns null when endTime is undefined', () => {
      expect(calculateDuration('09:00', undefined)).toBeNull();
    });

    it('returns null when endTime is empty string', () => {
      expect(calculateDuration('09:00', '')).toBeNull();
    });
  });

  describe('getTimezoneName', () => {
    it('returns timezone name with spaces instead of underscores', () => {
      const result = getTimezoneName();
      expect(result).not.toContain('_');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
