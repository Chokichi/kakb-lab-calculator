import { create } from 'zustand';
import { CalculatorState, CalculatorActions } from '../types';
import { CSVParser } from '../utils/csvParser';

type CalculatorStore = CalculatorState & CalculatorActions;

const csvParser = new CSVParser();

// Helper function to check if student value is within tolerance
function checkCorrectness(studentValue: number | null, expectedValue: number | null, tolerance: number): boolean | null {
  if (studentValue === null || expectedValue === null) return null;
  
  if (expectedValue === 0) {
    return Math.abs(studentValue) < 1e-10; // Very small tolerance for zero
  }
  
  return Math.abs(studentValue - expectedValue) / Math.abs(expectedValue) <= tolerance;
}

// Helper function to check if student value is close (between 10% and 15%)
function checkClose(studentValue: number | null, expectedValue: number | null): boolean | null {
  if (studentValue === null || expectedValue === null) return null;
  
  if (expectedValue === 0) {
    return false; // Can't be "close" to zero
  }
  
  const errorPercent = Math.abs(studentValue - expectedValue) / Math.abs(expectedValue);
  return errorPercent > 0.10 && errorPercent <= 0.15;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  rows: [],
  tolerance: 0.10,
  isLoading: false,
  error: null,

  setStudentValue: (id: string, trial: 'trial1' | 'trial2', value: number | null) => {
    set((state) => ({
      rows: state.rows.map((row) => {
        if (row.id === id) {
          const updatedRow = { 
            ...row, 
            [`studentValue${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: value 
          };
          
          // Check if the student value is correct or close
          const expectedValue = trial === 'trial1' ? row.computedValueTrial1 : row.computedValueTrial2;
          const isCorrect = checkCorrectness(value, expectedValue, state.tolerance);
          const isClose = checkClose(value, expectedValue);
          
          return {
            ...updatedRow,
            [`isCorrect${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: isCorrect,
            [`isClose${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: isClose,
            isChecking: false,
            isChecked: false
          };
        }
        return row;
      }),
    }));
  },

  setTolerance: (tolerance: number) => {
    set({ tolerance });
    // Recheck all values with new tolerance
    const { rows } = get();
    const updatedRows = rows.map((row) => ({
      ...row,
      isCorrectTrial1: checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance),
      isCorrectTrial2: checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance),
      isCloseTrial1: checkClose(row.studentValueTrial1, row.computedValueTrial1),
      isCloseTrial2: checkClose(row.studentValueTrial2, row.computedValueTrial2),
    }));
    set({ rows: updatedRows });
  },

  resetAll: () => {
    set((state) => ({
      rows: state.rows.map((row) => ({
        ...row,
        studentValueTrial1: null,
        studentValueTrial2: null,
        isCorrectTrial1: null,
        isCorrectTrial2: null,
        isCloseTrial1: null,
        isCloseTrial2: null,
        isChecking: false,
        isChecked: false,
      })),
    }));
  },

  loadData: (csvData: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const rows = csvParser.parseCSV(csvData);
      set({ rows, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to parse CSV data',
        isLoading: false 
      });
    }
  },

  recalculateAll: () => {
    // Simple validation against expected values
    const { rows, tolerance } = get();
    const updatedRows = rows.map((row) => ({
      ...row,
      isCorrectTrial1: checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance),
      isCorrectTrial2: checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance),
      isCloseTrial1: checkClose(row.studentValueTrial1, row.computedValueTrial1),
      isCloseTrial2: checkClose(row.studentValueTrial2, row.computedValueTrial2),
    }));
    set({ rows: updatedRows });
  },

  checkWork: (subsectionId: string) => {
    const { tolerance } = get();
    
    // Set checking state for all rows in this subsection
    set((state) => ({
      rows: state.rows.map((row) => {
        if (row.subsection === subsectionId) {
          return { ...row, isChecking: true, isChecked: false };
        }
        return row;
      }),
    }));

    // Simulate calculation delay (2-3 seconds)
    const delay = 2000 + Math.random() * 1000;
    
    setTimeout(() => {
      set((state) => ({
        rows: state.rows.map((row) => {
          if (row.subsection === subsectionId) {
            // Only check rows that have values entered
            const hasTrial1Value = row.studentValueTrial1 !== null;
            const hasTrial2Value = row.studentValueTrial2 !== null;
            
            const isCorrectTrial1 = hasTrial1Value ? 
              checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance) : null;
            const isCorrectTrial2 = hasTrial2Value ? 
              checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance) : null;
            
            const isCloseTrial1 = hasTrial1Value ? 
              checkClose(row.studentValueTrial1, row.computedValueTrial1) : null;
            const isCloseTrial2 = hasTrial2Value ? 
              checkClose(row.studentValueTrial2, row.computedValueTrial2) : null;
            
            return {
              ...row,
              isCorrectTrial1,
              isCorrectTrial2,
              isCloseTrial1,
              isCloseTrial2,
              isChecking: false,
              isChecked: true,
            };
          }
          return row;
        }),
      }));
    }, delay);
  },

  resetSubsection: (subsectionId: string) => {
    set((state) => ({
      rows: state.rows.map((row) => {
        if (row.subsection === subsectionId) {
          return {
            ...row,
            isCorrectTrial1: null,
            isCorrectTrial2: null,
            isCloseTrial1: null,
            isCloseTrial2: null,
            isChecking: false,
            isChecked: false,
          };
        }
        return row;
      }),
    }));
  },

}));