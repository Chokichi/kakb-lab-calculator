export interface CalculationRow {
  id: string;
  label: string;
  unit: string;
  formula: { trial1: string | null; trial2: string | null } | null; // Excel formulas for each trial
  inputs: string[]; // dependencies
  tolerance: number;
  studentValueTrial1: number | null;
  studentValueTrial2: number | null;
  computedValueTrial1: number | null;
  computedValueTrial2: number | null;
  isCorrectTrial1: boolean | null;
  isCorrectTrial2: boolean | null;
  isCloseTrial1: boolean | null;
  isCloseTrial2: boolean | null;
  isDirectInput: boolean; // true if this is a value students should enter directly
  isChecking: boolean; // true when this row is being checked
  isChecked: boolean; // true when this row has been checked
  section: string; // e.g., "The equilibrium constant of acetic acid"
  subsection: string; // e.g., "1b pH of 0.50 M HC2H3O2"
  trial1Value?: number; // reference value from CSV
  trial2Value?: number; // reference value from CSV
}

export interface CalculatorState {
  rows: CalculationRow[];
  tolerance: number;
  isLoading: boolean;
  error: string | null;
}

export interface CalculatorActions {
  setStudentValue: (id: string, trial: 'trial1' | 'trial2', value: number | null) => void;
  setTolerance: (tolerance: number) => void;
  resetAll: () => void;
  loadData: (csvData: string) => void;
  recalculateAll: () => void;
  checkWork: (subsectionId: string) => void;
  resetSubsection: (subsectionId: string) => void;
}
