import { create } from 'zustand';
import { CalculationRow, CalculatorState, CalculatorActions } from '../types';
import { HeaderBasedCSVParser } from '../utils/headerBasedCsvParser';
import { FormulaEngine } from '../utils/formulaEngine';
import { CalculatorConfig } from '../config/calculators';
import { LocalStorageManager } from '../utils/localStorage';

type CalculatorStore = CalculatorState & CalculatorActions;

const csvParser = new HeaderBasedCSVParser();
const formulaEngine = FormulaEngine.getInstance();

// Helper function to check if student value is within tolerance
function checkCorrectness(studentValue: number | null, expectedValue: number | null, tolerance: number): boolean | null {
  if (studentValue === null || expectedValue === null) return null;
  
  if (expectedValue === 0) {
    return Math.abs(studentValue) < 1e-10; // Very small tolerance for zero
  }
  
  return Math.abs(studentValue - expectedValue) / Math.abs(expectedValue) <= tolerance;
}

// Helper function to check if student value is close (between tolerance and toleranceClose)
function checkClose(studentValue: number | null, expectedValue: number | null, tolerance: number, toleranceClose: number): boolean | null {
  if (studentValue === null || expectedValue === null) return null;
  
  if (expectedValue === 0) {
    return false; // Can't be "close" to zero
  }
  
  const errorPercent = Math.abs(studentValue - expectedValue) / Math.abs(expectedValue);
  return errorPercent > tolerance && errorPercent <= toleranceClose;
}

// Helper function to extract dependencies from a formula
function extractDependencies(formula: string): string[] {
  if (!formula || !formula.startsWith('=')) return [];
  
  const cellRefRegex = /[A-Z]+\d+/g;
  const matches = formula.match(cellRefRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

// Helper function to check if all dependencies are available
function checkDependencies(dependencies: string[], availableValues: { [key: string]: number | string }): { canCalculate: boolean; missing: string[] } {
  const missing = dependencies.filter(dep => !(dep in availableValues));
  return {
    canCalculate: missing.length === 0,
    missing
  };
}

// Helper function to calculate expected values based on student inputs
function calculateExpectedValues(rows: CalculationRow[]): CalculationRow[] {
  // First pass: calculate values that only depend on student inputs
  let updatedRows = rows.map(row => {
    if (!row.formula) {
      return row; // No formula, keep existing values
    }

    // Create input map from student values and choices
    const inputs: { [key: string]: number | string } = {};
    
    // Map student inputs to data tags
    rows.forEach(r => {
      if (r.studentValueTrial1 !== null && r.trial1DataTag) {
        inputs[r.trial1DataTag] = r.studentValueTrial1;
      }
      if (r.studentValueTrial2 !== null && r.trial2DataTag) {
        inputs[r.trial2DataTag] = r.studentValueTrial2;
      }
      // Also include choice values
      if (r.studentChoiceTrial1 !== null && r.trial1DataTag) {
        inputs[r.trial1DataTag] = r.studentChoiceTrial1;
      }
      if (r.studentChoiceTrial2 !== null && r.trial2DataTag) {
        inputs[r.trial2DataTag] = r.studentChoiceTrial2;
      }
    });

    // Check dependencies for trial 1
    let missingDependenciesTrial1: string[] = [];
    let canCalculateTrial1 = true;
    if (row.formula.trial1) {
      const dependencies = extractDependencies(row.formula.trial1);
      const depCheck = checkDependencies(dependencies, inputs);
      canCalculateTrial1 = depCheck.canCalculate;
      missingDependenciesTrial1 = depCheck.missing;
    }

    // Check dependencies for trial 2
    let missingDependenciesTrial2: string[] = [];
    let canCalculateTrial2 = true;
    if (row.formula.trial2) {
      const dependencies = extractDependencies(row.formula.trial2);
      const depCheck = checkDependencies(dependencies, inputs);
      canCalculateTrial2 = depCheck.canCalculate;
      missingDependenciesTrial2 = depCheck.missing;
    }

    // Calculate expected values using formulas only if dependencies are met
    let computedValueTrial1 = row.computedValueTrial1;
    let computedValueTrial2 = row.computedValueTrial2;

    if (row.formula.trial1 && canCalculateTrial1) {
      const result1 = formulaEngine.evaluateFormula(row.formula.trial1, inputs);
      if (result1 !== null) {
        computedValueTrial1 = result1;
      }
    }

    if (row.formula.trial2 && canCalculateTrial2) {
      const result2 = formulaEngine.evaluateFormula(row.formula.trial2, inputs);
      if (result2 !== null) {
        computedValueTrial2 = result2;
      }
    }

    return {
      ...row,
      computedValueTrial1,
      computedValueTrial2,
      missingDependenciesTrial1,
      missingDependenciesTrial2,
      canCalculateTrial1,
      canCalculateTrial2
    };
  });

  // Second pass: calculate values that depend on other calculated values
  // This includes the "Average" formulas that reference other calculated values
  updatedRows = updatedRows.map(row => {
    if (!row.formula) {
      return row;
    }

    // Create input map including both student values and calculated values
    const inputs: { [key: string]: number | string } = {};
    
    updatedRows.forEach(r => {
      if (r.studentValueTrial1 !== null && r.trial1DataTag) {
        inputs[r.trial1DataTag] = r.studentValueTrial1;
      }
      if (r.studentValueTrial2 !== null && r.trial2DataTag) {
        inputs[r.trial2DataTag] = r.studentValueTrial2;
      }
      // Also include choice values
      if (r.studentChoiceTrial1 !== null && r.trial1DataTag) {
        inputs[r.trial1DataTag] = r.studentChoiceTrial1;
      }
      if (r.studentChoiceTrial2 !== null && r.trial2DataTag) {
        inputs[r.trial2DataTag] = r.studentChoiceTrial2;
      }
      // Also include calculated values that are available
      if (r.computedValueTrial1 !== null && r.trial1DataTag) {
        inputs[r.trial1DataTag] = r.computedValueTrial1;
      }
      if (r.computedValueTrial2 !== null && r.trial2DataTag) {
        inputs[r.trial2DataTag] = r.computedValueTrial2;
      }
    });

    // Check dependencies for trial 1
    let missingDependenciesTrial1: string[] = [];
    let canCalculateTrial1 = true;
    if (row.formula.trial1) {
      const dependencies = extractDependencies(row.formula.trial1);
      const depCheck = checkDependencies(dependencies, inputs);
      canCalculateTrial1 = depCheck.canCalculate;
      missingDependenciesTrial1 = depCheck.missing;
    }

    // Check dependencies for trial 2
    let missingDependenciesTrial2: string[] = [];
    let canCalculateTrial2 = true;
    if (row.formula.trial2) {
      const dependencies = extractDependencies(row.formula.trial2);
      const depCheck = checkDependencies(dependencies, inputs);
      canCalculateTrial2 = depCheck.canCalculate;
      missingDependenciesTrial2 = depCheck.missing;
    }

    // Only recalculate if we haven't already calculated this value and dependencies are met
    let computedValueTrial1 = row.computedValueTrial1;
    let computedValueTrial2 = row.computedValueTrial2;

    if (row.formula.trial1 && computedValueTrial1 === null && canCalculateTrial1) {
      const result1 = formulaEngine.evaluateFormula(row.formula.trial1, inputs);
      if (result1 !== null) {
        computedValueTrial1 = result1;
      }
    }

    if (row.formula.trial2 && computedValueTrial2 === null && canCalculateTrial2) {
      const result2 = formulaEngine.evaluateFormula(row.formula.trial2, inputs);
      if (result2 !== null) {
        computedValueTrial2 = result2;
      }
    }

    return {
      ...row,
      computedValueTrial1,
      computedValueTrial2,
      missingDependenciesTrial1,
      missingDependenciesTrial2,
      canCalculateTrial1,
      canCalculateTrial2
    };
  });

  return updatedRows;
}


export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  rows: [],
  tolerance: 0.10,
  toleranceClose: 0.15,
  title: 'Ka/Kb Lab Calculator',
  isLoading: false,
  error: null,

  setStudentValue: (id: string, trial: 'trial1' | 'trial2', value: number | null) => {
    set((state) => {
      // Find the row being updated to get its subsection
      const updatedRow = state.rows.find(row => row.id === id);
      const subsectionId = updatedRow?.subsection;

      // First update the student value and reset checked state for the entire subsection
      const updatedRows = state.rows.map((row) => {
        if (row.id === id) {
          return { 
            ...row, 
            [`studentValue${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: value,
            isChecking: false,
            isChecked: false
          };
        }
        // Reset checked state for all calculated rows in the same subsection
        // (but not for input rows like pH)
        if (row.subsection === subsectionId && !row.isDirectInput) {
          return {
            ...row,
            isChecked: false,
            isCorrectTrial1: null,
            isCorrectTrial2: null,
            isCloseTrial1: null,
            isCloseTrial2: null
          };
        }
        return row;
      });

      // Then recalculate all expected values based on current student inputs
      const recalculatedRows = calculateExpectedValues(updatedRows);

      // Auto-save to local storage
      setTimeout(() => {
        LocalStorageManager.saveData(recalculatedRows, get().title);
      }, 100);

      // Don't check correctness here - wait for "Check Work" button
      return { rows: recalculatedRows };
    });
  },

  setStudentChoice: (id: string, trial: 'trial1' | 'trial2', choice: string | null) => {
    set((state) => {
      // Find the row being updated to get its subsection
      const updatedRow = state.rows.find(row => row.id === id);
      const subsectionId = updatedRow?.subsection;

      // First update the student choice and reset checked state for the entire subsection
      const updatedRows = state.rows.map((row) => {
        if (row.id === id) {
          return { 
            ...row, 
            [`studentChoice${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: choice,
            isChecking: false,
            isChecked: false
          };
        }
        // Reset checked state for all calculated rows in the same subsection
        // (but not for input rows like pH)
        if (row.subsection === subsectionId && !row.isDirectInput) {
          return {
            ...row,
            isChecked: false,
            isCorrectTrial1: null,
            isCorrectTrial2: null,
            isCloseTrial1: null,
            isCloseTrial2: null
          };
        }
        return row;
      });

      // Then recalculate all expected values based on current student inputs
      const recalculatedRows = calculateExpectedValues(updatedRows);

      // Auto-save to local storage
      setTimeout(() => {
        LocalStorageManager.saveData(recalculatedRows, get().title);
      }, 100);

      // Don't check correctness here - wait for "Check Work" button
      return { rows: recalculatedRows };
    });
  },

  setStudentText: (id: string, trial: 'trial1' | 'trial2', text: string | null) => {
    set((state) => {
      // Find the row being updated to get its subsection
      const updatedRow = state.rows.find(row => row.id === id);
      const subsectionId = updatedRow?.subsection;

      // First update the student text and reset checked state for the entire subsection
      const updatedRows = state.rows.map((row) => {
        if (row.id === id) {
          return { 
            ...row, 
            [`studentText${trial === 'trial1' ? 'Trial1' : 'Trial2'}`]: text,
            isChecking: false,
            isChecked: false
          };
        }
        // Reset checked state for all calculated rows in the same subsection
        // (but not for input rows like pH)
        if (row.subsection === subsectionId && !row.isDirectInput) {
          return {
            ...row,
            isChecked: false,
            isCorrectTrial1: null,
            isCorrectTrial2: null,
            isCloseTrial1: null,
            isCloseTrial2: null
          };
        }
        return row;
      });

      // Then recalculate all expected values based on current student inputs
      const recalculatedRows = calculateExpectedValues(updatedRows);

      // Auto-save to local storage
      setTimeout(() => {
        LocalStorageManager.saveData(recalculatedRows, get().title);
      }, 100);

      // Don't check correctness here - wait for "Check Work" button
      return { rows: recalculatedRows };
    });
  },

    setTolerance: (tolerance: number) => {
      set({ tolerance });
      // Recheck all values with new tolerance
      const { rows, toleranceClose } = get();
      const updatedRows = rows.map((row) => ({
        ...row,
        isCorrectTrial1: checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance),
        isCorrectTrial2: checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance),
        isCloseTrial1: checkClose(row.studentValueTrial1, row.computedValueTrial1, tolerance, toleranceClose),
        isCloseTrial2: checkClose(row.studentValueTrial2, row.computedValueTrial2, tolerance, toleranceClose),
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
      const { rows, title, tolerance1, tolerance2 } = csvParser.parseCSV(csvData);
      set({ 
        rows, 
        title,
        tolerance: tolerance1,
        toleranceClose: tolerance2,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to parse CSV data',
        isLoading: false 
      });
    }
  },

  recalculateAll: () => {
    // Simple validation against expected values
    const { rows, tolerance, toleranceClose } = get();
    const updatedRows = rows.map((row) => ({
      ...row,
      isCorrectTrial1: checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance),
      isCorrectTrial2: checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance),
      isCloseTrial1: checkClose(row.studentValueTrial1, row.computedValueTrial1, tolerance, toleranceClose),
      isCloseTrial2: checkClose(row.studentValueTrial2, row.computedValueTrial2, tolerance, toleranceClose),
    }));
    set({ rows: updatedRows });
  },

  checkWork: (subsectionId: string) => {
    const { tolerance, toleranceClose } = get();
    
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
      set((state) => {
        // First recalculate all expected values based on current student inputs
        const recalculatedRows = calculateExpectedValues(state.rows);
        
        // Then check correctness for the subsection
        const finalRows = recalculatedRows.map((row) => {
          if (row.subsection === subsectionId) {
            // Only check calculated values (rows with formulas), not input values
            if (row.isDirectInput) {
              // For input values (like pH), just mark as checked but don't validate
              return {
                ...row,
                isChecking: false,
                isChecked: true,
                // Keep existing correctness values (should be null for inputs)
              };
            } else {
              // For calculated values, check correctness
              const hasTrial1Value = row.studentValueTrial1 !== null;
              const hasTrial2Value = row.studentValueTrial2 !== null;
              
              
              const isCorrectTrial1 = hasTrial1Value ? 
                checkCorrectness(row.studentValueTrial1, row.computedValueTrial1, tolerance) : null;
              const isCorrectTrial2 = hasTrial2Value ? 
                checkCorrectness(row.studentValueTrial2, row.computedValueTrial2, tolerance) : null;
              
                const isCloseTrial1 = hasTrial1Value ? 
                  checkClose(row.studentValueTrial1, row.computedValueTrial1, tolerance, toleranceClose) : null;
                const isCloseTrial2 = hasTrial2Value ? 
                  checkClose(row.studentValueTrial2, row.computedValueTrial2, tolerance, toleranceClose) : null;
              
              
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
          }
          return row;
        });
        
        return { rows: finalRows };
      });
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

    switchCalculator: (calculator: CalculatorConfig) => {
      set({ isLoading: true, error: null });
      
      // Load the new calculator's CSV data
      fetch(calculator.csvFile)
        .then(response => response.text())
        .then(content => {
          const { rows, title, tolerance1, tolerance2 } = csvParser.parseCSV(content);
          set({ 
            rows, 
            title,
            tolerance: tolerance1,
            toleranceClose: tolerance2,
            isLoading: false 
          });
        })
        .catch(error => {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load calculator data',
            isLoading: false 
          });
        });
    },

    saveToLocalStorage: () => {
      const { rows, title } = get();
      LocalStorageManager.saveData(rows, title);
    },

    restoreFromLocalStorage: () => {
      const savedData = LocalStorageManager.loadData();
      if (savedData) {
        set((state) => {
          // Merge saved student inputs with current rows
          const updatedRows = state.rows.map(row => {
            const savedRow = savedData.rows.find(saved => saved.id === row.id);
            if (savedRow) {
              return {
                ...row,
                studentValueTrial1: savedRow.studentValueTrial1,
                studentValueTrial2: savedRow.studentValueTrial2,
                studentChoiceTrial1: savedRow.studentChoiceTrial1,
                studentChoiceTrial2: savedRow.studentChoiceTrial2,
                studentTextTrial1: savedRow.studentTextTrial1,
                studentTextTrial2: savedRow.studentTextTrial2,
              };
            }
            return row;
          });

          // Recalculate all expected values with restored inputs
          const recalculatedRows = calculateExpectedValues(updatedRows);
          
          return { rows: recalculatedRows };
        });
      }
    },

    clearLocalStorage: () => {
      LocalStorageManager.clearData();
    },

}));