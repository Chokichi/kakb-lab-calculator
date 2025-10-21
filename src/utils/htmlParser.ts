import { CalculationRow } from '../types';

export class HTMLParser {
  constructor() {
    // Parser for the Excel-generated HTML format
  }

  /**
   * Parses the Excel-generated HTML data and converts it to CalculationRow objects
   */
  parseHTML(htmlData: string): CalculationRow[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) {
      throw new Error('No table found in HTML data');
    }

    const rows: CalculationRow[] = [];
    const tableRows = table.querySelectorAll('tr');
    let currentSection = '';
    let currentSubsection = '';
    let rowId = 1;

    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      const cells = row.querySelectorAll('td');
      
      if (cells.length < 6) continue;

      const section = this.getCellText(cells[0]);
      const subsection = this.getCellText(cells[1]);
      const label = this.getCellText(cells[2]);
      const trial1 = this.getCellText(cells[3]);
      const trial2 = this.getCellText(cells[4]);
      const unit = this.getCellText(cells[5]);
      const entryType = this.getCellText(cells[6]);

      // Handle section headers
      if (section === 'Section') {
        currentSection = subsection;
        currentSubsection = '';
        continue;
      }
      
      // Handle subsection headers
      if (section === 'Subsection') {
        currentSubsection = subsection;
        continue;
      }

      // Skip header rows
      if (label === 'Label' || !label) {
        continue;
      }

      // Create calculation row
      const calculationRow = this.createCalculationRow(
        rowId.toString(),
        label,
        unit,
        trial1,
        trial2,
        entryType,
        currentSection,
        currentSubsection
      );

      if (calculationRow) {
        rows.push(calculationRow);
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
    entryType: string,
    section: string,
    subsection: string
  ): CalculationRow | null {
    // Check if this is a formula (starts with =)
    const isFormulaTrial1 = trial1.startsWith('=');
    const isFormulaTrial2 = trial2.startsWith('=');
    
    // Parse the expected values from the HTML (for non-formula values)
    const expectedTrial1 = isFormulaTrial1 ? null : this.parseNumericValue(trial1);
    const expectedTrial2 = isFormulaTrial2 ? null : this.parseNumericValue(trial2);
    
    // Clean the label for comparison
    const cleanLabel = this.cleanLabel(label).toLowerCase();
    
    // Determine if this is a direct input based on entry type
    const isDirectInput = entryType === 'Data';
    
    // Students should be able to enter both direct inputs and calculated values for verification
    const shouldAllowInput = entryType === 'Data' || entryType === 'Calculated';

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
      trial2Value: expectedTrial2 || undefined
    };
  }

  private getCellText(cell: Element): string {
    return cell.textContent?.trim() || '';
  }

  private cleanLabel(label: string): string {
    // Remove leading numbers and letters (like "1ba", "2a", etc.)
    return label.replace(/^\d+[a-z]*\s*/, '').trim();
  }

  private cleanSubsectionTitle(subsection: string): string {
    // Remove the leading section identifier (like "1b ", "2a ", etc.) from subsection titles
    return subsection.replace(/^\d+[a-z]\s*/, '').trim();
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
