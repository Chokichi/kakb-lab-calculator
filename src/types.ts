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
  shouldAllowInput: boolean; // true if students should be able to enter values (both inputs and calculated values)
  isChecking: boolean; // true when this row is being checked
  isChecked: boolean; // true when this row has been checked
  section: string; // e.g., "The equilibrium constant of acetic acid"
  subsection: string; // e.g., "1b pH of 0.50 M HC2H3O2"
  trial1Value?: number; // reference value from CSV
  trial2Value?: number; // reference value from CSV
  trial1DataTag: string; // Data tag for trial 1 (e.g., "F4", "G5")
  trial2DataTag: string; // Data tag for trial 2 (e.g., "F4", "G5")
  missingDependenciesTrial1: string[]; // Data tags that need values for trial 1
  missingDependenciesTrial2: string[]; // Data tags that need values for trial 2
  canCalculateTrial1: boolean; // Whether trial 1 can be calculated
  canCalculateTrial2: boolean; // Whether trial 2 can be calculated
  // New fields for Choice data type
  entryType: string; // "Data", "Calculated", or "Choice"
  choiceOptionsTrial1?: string[]; // Options for trial 1 choice (e.g., ["First", "Second"])
  choiceOptionsTrial2?: string[]; // Options for trial 2 choice
  studentChoiceTrial1: string | null; // Selected choice for trial 1
  studentChoiceTrial2: string | null; // Selected choice for trial 2
  // Text value fields for Text entry type
  studentTextTrial1: string | null; // Text value for trial 1
  studentTextTrial2: string | null; // Text value for trial 2
  // Column headers for flexible input columns
  columnHeaders?: { trial1: string; trial2: string };
}

export interface CalculatorState {
  rows: CalculationRow[];
  tolerance: number;
  toleranceClose: number; // Added for "close" tolerance
  title: string; // Added for page title
  isLoading: boolean;
  error: string | null;
}

export interface CalculatorActions {
  setStudentValue: (id: string, trial: 'trial1' | 'trial2', value: number | null) => void;
  setStudentChoice: (id: string, trial: 'trial1' | 'trial2', choice: string | null) => void;
  setStudentText: (id: string, trial: 'trial1' | 'trial2', text: string | null) => void;
  setTolerance: (tolerance: number) => void;
  resetAll: () => void;
  loadData: (csvData: string) => void;
  recalculateAll: () => void;
  checkWork: (subsectionId: string) => void;
  resetSubsection: (subsectionId: string) => void;
  switchCalculator: (calculator: any) => void; // Added for calculator switching
}
