import { create } from 'zustand';
import { CalculatorState, CalculatorActions } from '../types';
import { CSVParser } from '../utils/csvParser';
import { FormulaEngine } from '../utils/formulaEngine';

type CalculatorStore = CalculatorState & CalculatorActions;

const csvParser = new CSVParser();
const formulaEngine = FormulaEngine.getInstance();

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

// Helper function to calculate expected values based on student inputs
function calculateExpectedValues(rows: any[]): any[] {
  return rows.map(row => {
    if (!row.formula) {
      return row; // No formula, keep existing values
    }

    // Create input map from student values
    const inputs: { [key: string]: number } = {};
    
    // Map student inputs to cell references
    rows.forEach(r => {
      if (r.studentValueTrial1 !== null) {
        const cellRef = getCellReferenceFromLabel(r.label, r.section, r.subsection, 'trial1');
        if (cellRef) inputs[cellRef] = r.studentValueTrial1;
      }
      if (r.studentValueTrial2 !== null) {
        const cellRef = getCellReferenceFromLabel(r.label, r.section, r.subsection, 'trial2');
        if (cellRef) inputs[cellRef] = r.studentValueTrial2;
      }
    });

    // Calculate expected values using formulas
    let computedValueTrial1 = row.computedValueTrial1;
    let computedValueTrial2 = row.computedValueTrial2;

    if (row.formula.trial1) {
      const result1 = formulaEngine.evaluateFormula(row.formula.trial1, inputs);
      computedValueTrial1 = result1;
    }

    if (row.formula.trial2) {
      const result2 = formulaEngine.evaluateFormula(row.formula.trial2, inputs);
      computedValueTrial2 = result2;
    }

    return {
      ...row,
      computedValueTrial1,
      computedValueTrial2
    };
  });
}

// Helper function to map labels to cell references
function getCellReferenceFromLabel(label: string, section: string, subsection: string, trial: 'trial1' | 'trial2'): string | null {
  const cleanLabel = label.toLowerCase();
  const col = trial === 'trial1' ? 'D' : 'E';
  
  // Map based on section and label patterns
  if (section.includes('equilibrium constant of acetic acid')) {
    if (cleanLabel.includes('ph of 0.50 m hc2h3o2')) return col + '2';
    if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '3';
    if (cleanLabel.includes('[c2h3o2^-]') || cleanLabel.includes('[c2h3o2-]')) return col + '4';
    if (cleanLabel.includes('[hc2h3o2]')) return col + '5';
    if (cleanLabel.includes('keq')) return col + '6';
  }
  
  if (subsection.includes('pH of 0.20 M HC2H3O2')) {
    if (cleanLabel.includes('ph of solution')) return col + '8';
    if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '9';
    if (cleanLabel.includes('[c2h3o2^-]') || cleanLabel.includes('[c2h3o2-]')) return col + '10';
    if (cleanLabel.includes('[hc2h3o2]')) return col + '11';
    if (cleanLabel.includes('keq')) return col + '12';
  }
  
  if (subsection.includes('0.50 M HC2H3O2 and solid NaC2H3O2')) {
    if (cleanLabel.includes('grams of nac2h3o2')) return col + '14';
    if (cleanLabel.includes('ph of mixture')) return col + '15';
    if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '16';
    if (cleanLabel.includes('[c2h3o2^-]') || cleanLabel.includes('[c2h3o2-]')) return col + '17';
    if (cleanLabel.includes('[hc2h3o2]')) return col + '18';
    if (cleanLabel.includes('keq')) return col + '19';
  }
  
  if (section.includes('Keq of an unknown weak acid')) {
    if (subsection.includes('pH of 0.10M Unknown Acid')) {
      if (cleanLabel.includes('unknown #')) return col + '24';
      if (cleanLabel.includes('ph')) return col + '25';
      if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '26';
      if (cleanLabel.includes('[a^-]') || cleanLabel.includes('[a-]')) return col + '27';
      if (cleanLabel.includes('[ha]')) return col + '28';
      if (cleanLabel.includes('keq')) return col + '29';
    }
    
    if (subsection.includes('5 mL of 0.1M NaOH plus 25 mL of Unknown Acid')) {
      if (cleanLabel.includes('ph of mixture')) return col + '31';
      if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '32';
      if (cleanLabel.includes('[a^-]') || cleanLabel.includes('[a-]')) return col + '33';
      if (cleanLabel.includes('[ha]')) return col + '34';
      if (cleanLabel.includes('keq')) return col + '35';
    }
    
    if (subsection.includes('15 mL of 0.1M NaOH plus 30 mL of Unknown Acid')) {
      if (cleanLabel.includes('ph of mixture')) return col + '37';
      if (cleanLabel.includes('[h^+]') || cleanLabel.includes('[h+]')) return col + '38';
      if (cleanLabel.includes('[a^-]') || cleanLabel.includes('[a-]')) return col + '39';
      if (cleanLabel.includes('[ha]')) return col + '40';
      if (cleanLabel.includes('keq')) return col + '41';
    }
  }
  
  if (section.includes('The Equilibrium Constant of a Weak Base')) {
    if (subsection.includes('pH of 0.50M Unknown Weak Base')) {
      if (cleanLabel.includes('ph of 0.50m unknown weak base')) return col + '45';
      if (cleanLabel.includes('[oh^]') || cleanLabel.includes('[oh-]')) return col + '46';
      if (cleanLabel.includes('[hb^+]') || cleanLabel.includes('[hb+]')) return col + '47';
      if (cleanLabel.includes('[b]')) return col + '48';
      if (cleanLabel.includes('keq')) return col + '49';
    }
    
    if (subsection.includes('5 mL of 0.1M HCl plus 20 mL of 0.50 M Unknown Base')) {
      if (cleanLabel.includes('ph of mixture')) return col + '51';
      if (cleanLabel.includes('[oh^]') || cleanLabel.includes('[oh-]')) return col + '52';
      if (cleanLabel.includes('[hb^+]') || cleanLabel.includes('[hb+]')) return col + '53';
      if (cleanLabel.includes('[b]')) return col + '54';
      if (cleanLabel.includes('keq')) return col + '55';
    }
  }
  
  return null;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  rows: [],
  tolerance: 0.10,
  isLoading: false,
  error: null,

  setStudentValue: (id: string, trial: 'trial1' | 'trial2', value: number | null) => {
    set((state) => {
      // First update the student value
      const updatedRows = state.rows.map((row) => {
        if (row.id === id) {
          return { 
            ...row, 
            [`studentValue${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: value,
            isChecking: false,
            isChecked: false
          };
        }
        return row;
      });

      // Then recalculate all expected values based on current student inputs
      const recalculatedRows = calculateExpectedValues(updatedRows);

      // Finally check correctness for all rows
      const finalRows = recalculatedRows.map((row) => {
        const isCorrectTrial1 = checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, state.tolerance);
        const isCorrectTrial2 = checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, state.tolerance);
        const isCloseTrial1 = checkClose(row.studentValueTrial1, row.computedValueTrial1);
        const isCloseTrial2 = checkClose(row.studentValueTrial2, row.computedValueTrial2);

        return {
          ...row,
          isCorrectTrial1,
          isCorrectTrial2,
          isCloseTrial1,
          isCloseTrial2
        };
      });

      return { rows: finalRows };
    });
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