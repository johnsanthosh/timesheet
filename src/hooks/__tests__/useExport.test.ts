import { renderHook, act } from '@testing-library/react';
import { useExport } from '../useExport';

// Note: Full testing of useExport requires mocking multiple ESM modules
// (timesheet service, export utilities). For ESM compatibility, we test
// what we can without complex mocking.

describe('useExport hook', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeNull();
    expect(typeof result.current.exportData).toBe('function');
  });

  it('has exportData function that is callable', () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.exportData).toBeDefined();
    expect(typeof result.current.exportData).toBe('function');
  });
});
