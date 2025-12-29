// Mock timesheet service
export const createTimeEntry = jest.fn();
export const updateTimeEntry = jest.fn();
export const deleteTimeEntry = jest.fn();
export const getUserTimeEntries = jest.fn(() => Promise.resolve([]));
export const getAllTimeEntries = jest.fn(() => Promise.resolve([]));
export const getTimeEntriesByDateRange = jest.fn(() => Promise.resolve([]));
export const getAllTimeEntriesByDateRange = jest.fn(() => Promise.resolve([]));
