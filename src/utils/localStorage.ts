import { CalculationRow } from '../types';

const STORAGE_KEY = 'lab-calculator-data';
const TIMESTAMP_KEY = 'lab-calculator-timestamp';

export interface SavedData {
  rows: CalculationRow[];
  title: string;
  timestamp: number;
}

export class LocalStorageManager {
  /**
   * Save current calculator state to local storage
   */
  static saveData(rows: CalculationRow[], title: string): void {
    try {
      const data: SavedData = {
        rows: rows.map(row => ({
          ...row,
          // Only save student inputs, not computed values
          studentValueTrial1: row.studentValueTrial1,
          studentValueTrial2: row.studentValueTrial2,
          studentChoiceTrial1: row.studentChoiceTrial1,
          studentChoiceTrial2: row.studentChoiceTrial2,
          studentTextTrial1: row.studentTextTrial1,
          studentTextTrial2: row.studentTextTrial2,
        })),
        title,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, data.timestamp.toString());
    } catch (error) {
      console.warn('Failed to save data to local storage:', error);
    }
  }

  /**
   * Load saved data from local storage
   */
  static loadData(): SavedData | null {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return null;

      const data: SavedData = JSON.parse(savedData);
      
      // Check if data is not too old (e.g., within 7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const now = Date.now();
      if (now - data.timestamp > maxAge) {
        this.clearData();
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to load data from local storage:', error);
      return null;
    }
  }

  /**
   * Check if there's saved data available
   */
  static hasSavedData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Get the timestamp of saved data
   */
  static getSavedTimestamp(): number | null {
    try {
      const timestamp = localStorage.getItem(TIMESTAMP_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear saved data from local storage
   */
  static clearData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
