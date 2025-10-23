import { CalculationRow } from '../types';

export class CSVParser {
  constructor() {
    // Parser for the structured CSV format with formulas
  }

  /**
   * Parses the new structured CSV data and converts it to CalculationRow objects
   */
  parseCSV(csvData: string): { rows: CalculationRow[], title: string, tolerance1: number, tolerance2: number } {
    const lines = csvData.split('\n');
    const rows: CalculationRow[] = [];
    let currentSection = '';
    let currentSubsection = '';
    
    // Extract parameters from first row
    const firstRow = this.parseCSVLine(lines[0]);
    const title = firstRow[1] || 'Ka/Kb Lab Calculator';
    const tolerance1 = parseFloat(firstRow[3]) || 0.1;
    const tolerance2 = parseFloat(firstRow[5]) || 0.15;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseCSVLine(line);
      if (columns.length < 8) continue;

      const [section, subsection, trial1DataTag, trial2DataTag, label, column1, unit, entryType] = columns;
      
      // Skip rows where trial1DataTag is empty (no data tag means no input)
      if (!trial1DataTag || trial1DataTag.trim() === '') continue;
      
      // Parse the new flexible column format: "Input 1; Trial 1" or "Input 1; Input 2"
      const columnParts = column1.split(';').map(part => part.trim());
      const inputCount = columnParts.length;
      
      // For now, handle up to 2 inputs (can be extended later)
      const trial1 = inputCount > 0 ? columnParts[0] : 'NA';
      const trial2 = inputCount > 1 ? columnParts[1] : 'NA';
      
      // Extract column headers (labels for the input columns)
      const columnHeaders = {
        trial1: inputCount > 0 ? columnParts[0] : '',
        trial2: inputCount > 1 ? columnParts[1] : ''
      };

      // Handle section headers
      if (section && !subsection && !trial1DataTag && !trial2DataTag && !label) {
        currentSection = section;
        currentSubsection = '';
        continue;
      }
      
      // Handle subsection headers
      if (!section && subsection && !trial1DataTag && !trial2DataTag && !label) {
        currentSubsection = subsection;
        continue;
      }

        // Skip header row
        if (section === 'Section') {
          continue;
        }
        
        // Skip rows where column1 is empty or just contains labels
        if (!column1 || column1.trim() === '') {
          continue;
        }

      // Skip rows without labels or with empty labels
      if (!label || label.trim() === '') {
        continue;
      }

      // Use the actual line number (i + 1) as the row ID to match Excel formulas
      const rowId = (i + 1).toString();

      // Create calculation row
      const row = this.createCalculationRow(
        rowId,
        label,
        unit,
        trial1,
        trial2,
        entryType,
        currentSection,
        currentSubsection,
        trial1DataTag,
        trial2DataTag,
        columnHeaders
      );

      if (row) {
        rows.push(row);
      }
    }

    return { rows, title, tolerance1, tolerance2 };
  }

  private createCalculationRow(
    id: string,
    label: string,
    unit: string,
    trial1: string,
    trial2: string,
    entryType: string,
    section: string,
    subsection: string,
    trial1DataTag: string,
    trial2DataTag: string,
    columnHeaders?: { trial1: string; trial2: string }
  ): CalculationRow | null {
    // Check if this is a formula (starts with =)
    const isFormulaTrial1 = trial1.startsWith('=');
    const isFormulaTrial2 = trial2.startsWith('=');
    
    // Parse the expected values from the CSV (for non-formula values)
    const expectedTrial1 = isFormulaTrial1 ? null : this.parseNumericValue(trial1);
    const expectedTrial2 = isFormulaTrial2 ? null : this.parseNumericValue(trial2);
    
    // Clean the label for comparison (not used in new format but kept for compatibility)
    // const cleanLabel = this.cleanLabel(label).toLowerCase();
    
    // Determine if this is a direct input based on entry type
    const isDirectInput = entryType === 'Data' || entryType === 'Choice';
    
    // Students should be able to enter both direct inputs and calculated values for verification
    const shouldAllowInput = entryType === 'Data' || entryType === 'Calculated' || entryType === 'Choice';

    // Parse choice options for Choice entries
    const choiceOptionsTrial1 = entryType === 'Choice' && trial1 && trial1.includes(';') 
      ? trial1.split(';').map(opt => opt.trim()) 
      : undefined;
    const choiceOptionsTrial2 = entryType === 'Choice' && trial2 && trial2.includes(';') 
      ? trial2.split(';').map(opt => opt.trim()) 
      : undefined;

    return {
      id,
      label: this.cleanLabel(label),
      unit: unit || '',
      formula: isFormulaTrial1 || isFormulaTrial2 ? {
        trial1: isFormulaTrial1 ? trial1 : null,
        trial2: isFormulaTrial2 ? trial2 : null
      } : null,
      inputs: this.extractInputs(trial1, trial2),
      tolerance: 0.10, // Default 10% tolerance
      studentValueTrial1: null,
      studentValueTrial2: null,
      computedValueTrial1: expectedTrial1 || null,
      computedValueTrial2: expectedTrial2 || null,
      isCorrectTrial1: null,
      isCorrectTrial2: null,
      isCloseTrial1: null,
      isCloseTrial2: null,
      isDirectInput: isDirectInput, // Only true for actual input values like pH
      shouldAllowInput: shouldAllowInput, // True for both inputs and calculated values
      isChecking: false,
      isChecked: false,
      section: section || 'Default',
      subsection: this.cleanSubsectionTitle(subsection) || '',
      trial1Value: expectedTrial1 || undefined,
      trial2Value: expectedTrial2 || undefined,
      trial1DataTag: (trial1 === 'NA' || trial1 === '') ? '' : (trial1DataTag || ''),
      trial2DataTag: (trial2 === 'NA' || trial2 === '') ? '' : (trial2DataTag || ''),
      missingDependenciesTrial1: [],
      missingDependenciesTrial2: [],
      canCalculateTrial1: !isFormulaTrial1, // Can calculate if it's not a formula
      canCalculateTrial2: !isFormulaTrial2, // Can calculate if it's not a formula
      // New fields for Choice data type
      entryType: entryType,
      choiceOptionsTrial1,
      choiceOptionsTrial2,
      studentChoiceTrial1: null,
      studentChoiceTrial2: null,
      // Column headers for flexible input columns
      columnHeaders: columnHeaders
    };
  }


  private cleanLabel(label: string): string {
    // Remove leading numbers and letters (like "1ba", "2a", etc.)
    return label.replace(/^\d+[a-z]*\s*/, '').trim();
  }

  private cleanSubsectionTitle(subsection: string): string {
    // Remove the leading section identifier (like "1b ", "2a ", etc.) from subsection titles
    return subsection.replace(/^\d+[a-z]\s*/, '').trim();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private parseNumericValue(value: string): number | undefined {
    if (!value || value.startsWith('=')) return undefined;
    
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  private extractInputs(trial1: string, trial2: string): string[] {
    const inputs = new Set<string>();
    
    // Extract cell references from formulas
    const cellRefRegex = /[A-Z]+\d+/g;
    
    if (trial1.startsWith('=')) {
      const matches = trial1.match(cellRefRegex);
      if (matches) {
        matches.forEach(match => inputs.add(match));
      }
    }
    
    if (trial2.startsWith('=')) {
      const matches = trial2.match(cellRefRegex);
      if (matches) {
        matches.forEach(match => inputs.add(match));
      }
    }
    
    return Array.from(inputs);
  }
}