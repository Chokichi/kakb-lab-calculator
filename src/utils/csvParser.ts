import { CalculationRow } from '../types';

export class CSVParser {
  constructor() {
    // Parser for the structured CSV format with formulas
  }

  /**
   * Parses the new structured CSV data and converts it to CalculationRow objects
   */
  parseCSV(csvData: string): CalculationRow[] {
    const lines = csvData.split('\n');
    const rows: CalculationRow[] = [];
    let currentSection = '';
    let currentSubsection = '';
    let rowId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseCSVLine(line);
      if (columns.length < 6) continue;

      const [col1, col2, col3, trial1, trial2, unit] = columns;

      // Handle section headers (Section,Title,...)
      if (col1 === 'Section') {
        currentSection = col2; // The actual section title is in col2
        currentSubsection = ''; // Reset subsection when we hit a new section
        continue;
      }
      
      // Handle subsection headers (Subsection,Title,...)
      if (col1 === 'Subsection') {
        currentSubsection = col2; // The actual subsection title is in col2
        continue;
      }

      // Skip header rows and empty rows
      if (col3 === 'Trial 1' || col3 === 'Trial 2' || !col3) {
        continue;
      }

      // Skip special rows
      if (col3 === 'Unknown #:' || col3.includes('Average') || col3.includes('percent error')) {
        continue;
      }

      // Skip rows with empty labels
      if (!col3 || col3.trim() === '') {
        continue;
      }

      // Create calculation row
      const row = this.createCalculationRow(
        rowId.toString(),
        col3, // label is in col3
        unit,
        trial1,
        trial2,
        currentSection,
        currentSubsection
      );

      if (row) {
        rows.push(row);
        rowId++;
      }
    }

    return rows;
  }

  private createCalculationRow(
    id: string,
    label: string,
    unit: string,
    trial1: string,
    trial2: string,
    section: string,
    subsection: string
  ): CalculationRow | null {
    // Check if this is a formula (starts with =)
    const isFormulaTrial1 = trial1.startsWith('=');
    const isFormulaTrial2 = trial2.startsWith('=');
    
    // Parse the expected values from the CSV (for non-formula values)
    const expectedTrial1 = isFormulaTrial1 ? null : this.parseNumericValue(trial1);
    const expectedTrial2 = isFormulaTrial2 ? null : this.parseNumericValue(trial2);
    
    // Clean the label for comparison
    const cleanLabel = this.cleanLabel(label).toLowerCase();
    
    // Determine if this is a direct input (what students should enter)
    const isDirectInput = this.isDirectInput(cleanLabel);
    
    // Students should be able to enter both direct inputs and calculated values for verification
    const shouldAllowInput = isDirectInput || this.isCalculatedValue(cleanLabel);

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
      isDirectInput: shouldAllowInput,
      isChecking: false,
      isChecked: false,
      section: section || 'Default',
      subsection: this.cleanSubsectionTitle(subsection) || '',
      trial1Value: expectedTrial1 || undefined,
      trial2Value: expectedTrial2 || undefined
    };
  }

  private isDirectInput(cleanLabel: string): boolean {
    return (
      cleanLabel.includes('ph of 0.50 m hc2h3o2') ||
      cleanLabel.includes('ph of 0.20 m hc2h3o2') ||
      cleanLabel.includes('ph of solution') ||
      cleanLabel.includes('grams of nac2h3o2') ||
      cleanLabel.includes('ph of mixture') ||
      cleanLabel.includes('ph of 0.10m unknown acid') ||
      cleanLabel.includes('ph of 0.50m unknown weak base') ||
      cleanLabel.includes('unknown #') ||
      cleanLabel === 'ph' ||
      cleanLabel === 'ph of 0.50m unknown weak base'
    );
  }

  private isCalculatedValue(cleanLabel: string): boolean {
    return (
      cleanLabel.includes('[h+]') ||
      cleanLabel.includes('[h^+]') ||
      cleanLabel.includes('[c2h3o2-]') ||
      cleanLabel.includes('[c2h3o2^-]') ||
      cleanLabel.includes('[hc2h3o2]') ||
      cleanLabel.includes('keq') ||
      cleanLabel.includes('[a-]') ||
      cleanLabel.includes('[ha]') ||
      cleanLabel.includes('[oh-]') ||
      cleanLabel.includes('[oh^]') ||
      cleanLabel.includes('[hb+]') ||
      cleanLabel.includes('[b]')
    );
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