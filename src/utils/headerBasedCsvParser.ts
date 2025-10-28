import { CalculationRow } from '../types';

interface ColumnMapping {
  title: number;
  tolerance1: number;
  tolerance2: number;
  section: number;
  subsection: number;
  label: number;
  unit: number;
  entryType: number;
  dataRefs: number[];
  trials: number[];
}

export class HeaderBasedCSVParser {
  constructor() {
    // Header-based parser for flexible CSV formats
  }

  /**
   * Detects column structure from headers
   */
  private detectColumnStructure(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
      title: -1,
      tolerance1: -1,
      tolerance2: -1,
      section: -1,
      subsection: -1,
      label: -1,
      unit: -1,
      entryType: -1,
      dataRefs: [],
      trials: []
    };

    headers.forEach((header, index) => {
      const lower = header.toLowerCase().trim();
      if (lower === 'title') mapping.title = index;
      else if (lower === 'tolerance 1') mapping.tolerance1 = index;
      else if (lower === 'tolerance 2') mapping.tolerance2 = index;
      else if (lower === 'section') mapping.section = index;
      else if (lower === 'subsection') mapping.subsection = index;
      else if (lower === 'label') mapping.label = index;
      else if (lower === 'unit') mapping.unit = index;
      else if (lower === 'entry type') mapping.entryType = index;
      else if (lower.startsWith('dataref')) mapping.dataRefs.push(index);
      else if (lower.startsWith('trial') || lower.startsWith('sample')) mapping.trials.push(index);
    });

    return mapping;
  }

  /**
   * Parses CSV data using header-based detection
   */
  parseCSV(csvData: string): { rows: CalculationRow[], title: string, tolerance1: number, tolerance2: number } {
    const lines = csvData.split('\n');
    const rows: CalculationRow[] = [];
    let currentSection = '';
    let currentSubsection = '';
    
    // Parse first row for title and tolerances
    const firstRow = this.parseCSVLine(lines[0]);
    const title = firstRow[1] || 'Lab Calculator';
    const tolerance1 = parseFloat(firstRow[3]) || 0.1;
    const tolerance2 = parseFloat(firstRow[5]) || 0.15;

    // Parse header row to detect column structure
    const headerRow = this.parseCSVLine(lines[1]);
    const columnMapping = this.detectColumnStructure(headerRow);

    // Validate required columns
    if (columnMapping.label === -1 || columnMapping.unit === -1 || columnMapping.entryType === -1) {
      throw new Error('Missing required columns: Label, Unit, or Entry Type');
    }

    // Process data rows
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseCSVLine(line);
      if (columns.length < Math.max(columnMapping.label, columnMapping.unit, columnMapping.entryType) + 1) {
        continue;
      }

      // Extract section and subsection
      const section = columnMapping.section >= 0 ? columns[columnMapping.section] : '';
      const subsection = columnMapping.subsection >= 0 ? columns[columnMapping.subsection] : '';

      // Handle section headers
      if (section && !subsection && !this.hasDataRefs(columns, columnMapping)) {
        currentSection = section;
        currentSubsection = '';
        continue;
      }
      
      // Handle subsection headers
      if (!section && subsection && !this.hasDataRefs(columns, columnMapping)) {
        currentSubsection = subsection;
        continue;
      }

      // Skip header row
      if (section === 'Section') {
        continue;
      }

      // Skip rows without labels
      const label = columns[columnMapping.label];
      if (!label || label.trim() === '') {
        continue;
      }

      // Create calculation row
      const row = this.createCalculationRow(
        (i + 1).toString(), // Use line number as ID
        columns,
        columnMapping,
        currentSection,
        currentSubsection
      );

      if (row) {
        rows.push(row);
      }
    }

    return { rows, title, tolerance1, tolerance2 };
  }

  /**
   * Checks if a row has data references (indicating it's a data row, not a header)
   */
  private hasDataRefs(columns: string[], mapping: ColumnMapping): boolean {
    return mapping.dataRefs.some(index => 
      index < columns.length && columns[index] && columns[index].trim() !== ''
    );
  }

  /**
   * Creates a calculation row from parsed data
   */
  private createCalculationRow(
    id: string,
    columns: string[],
    mapping: ColumnMapping,
    section: string,
    subsection: string
  ): CalculationRow | null {
    const label = columns[mapping.label];
    const unit = columns[mapping.unit] || '';
    const entryType = columns[mapping.entryType] || 'Data';

    // Extract trial data
    const trialData: { [key: string]: { dataRef: string; value: string } } = {};
    
    // Map DataRef columns to Trial columns
    mapping.dataRefs.forEach((dataRefIndex, trialIndex) => {
      const trialIndex2 = mapping.trials[trialIndex];
      if (trialIndex2 !== undefined && trialIndex2 < columns.length) {
        let dataRef = columns[dataRefIndex] || '';
        const value = columns[trialIndex2] || '';
        
        // Strip = prefix from dataRef if present (e.g., =E4 -> E4)
        if (dataRef.startsWith('=')) {
          dataRef = dataRef.substring(1);
        }
        
        // Always create trial data if dataRef exists, but mark NA values as empty
        if (dataRef && dataRef.trim() !== '') {
          const isNA = value.trim().toUpperCase() === 'NA';
          trialData[`trial${trialIndex + 1}`] = { 
            dataRef, 
            value: isNA ? '' : value 
          };
        }
      }
    });
    
    // Determine if this is a direct input
    const isDirectInput = entryType === 'Data' || entryType === 'Choice' || entryType === 'Text';
    const shouldAllowInput = entryType === 'Data' || entryType === 'Calculated' || entryType === 'Choice' || entryType === 'Text';

    // Parse choice options for Choice entries
    const choiceOptions: { [key: string]: string[] } = {};
    Object.keys(trialData).forEach(trialKey => {
      const trial = trialData[trialKey];
      if (entryType === 'Choice' && trial.value && trial.value.includes(';')) {
        choiceOptions[trialKey] = trial.value.split(';').map(opt => opt.trim());
      }
    });

    // Create formula objects for calculated values
    const formula: { [key: string]: string | null } = {};
    Object.keys(trialData).forEach(trialKey => {
      const trial = trialData[trialKey];
      const isFormula = trial.value.startsWith('=');
      formula[trialKey] = isFormula ? trial.value : null;
    });

    // Parse expected values for non-formula values
    const expectedValues: { [key: string]: number | null } = {};
    Object.keys(trialData).forEach(trialKey => {
      const trial = trialData[trialKey];
      if (!trial.value.startsWith('=')) {
        const numValue = this.parseNumericValue(trial.value);
        expectedValues[trialKey] = numValue;
      }
    });

    // Create the calculation row
    const row: CalculationRow = {
      id,
      label: this.cleanLabel(label),
      unit,
      formula: Object.keys(formula).length > 0 ? formula as any : null,
      inputs: this.extractInputs(trialData),
      tolerance: 0.10,
      studentValueTrial1: null,
      studentValueTrial2: null,
      computedValueTrial1: expectedValues.trial1 || null,
      computedValueTrial2: expectedValues.trial2 || null,
      isCorrectTrial1: null,
      isCorrectTrial2: null,
      isCloseTrial1: null,
      isCloseTrial2: null,
      isDirectInput: isDirectInput,
      shouldAllowInput: shouldAllowInput,
      isChecking: false,
      isChecked: false,
      section: section || 'Default',
      subsection: this.cleanSubsectionTitle(subsection) || '',
      trial1Value: expectedValues.trial1 || undefined,
      trial2Value: expectedValues.trial2 || undefined,
      trial1DataTag: trialData.trial1?.dataRef || '',
      trial2DataTag: trialData.trial2?.dataRef || '',
      trial1HasInput: (trialData.trial1?.dataRef && trialData.trial1?.value !== '' && trialData.trial1?.value.toUpperCase() !== 'NA') || false,
      trial2HasInput: (trialData.trial2?.dataRef && trialData.trial2?.value !== '' && trialData.trial2?.value.toUpperCase() !== 'NA') || false,
      missingDependenciesTrial1: [],
      missingDependenciesTrial2: [],
      canCalculateTrial1: !formula.trial1,
      canCalculateTrial2: !formula.trial2,
      entryType: entryType,
      choiceOptionsTrial1: choiceOptions.trial1,
      choiceOptionsTrial2: choiceOptions.trial2,
      studentChoiceTrial1: null,
      studentChoiceTrial2: null,
      studentTextTrial1: null,
      studentTextTrial2: null,
      columnHeaders: this.generateColumnHeaders(trialData)
    };

    return row;
  }

  /**
   * Generates column headers based on trial data
   */
  private generateColumnHeaders(trialData: { [key: string]: { dataRef: string; value: string } }): { trial1: string; trial2: string } {
    return {
      trial1: trialData.trial1 ? 'Trial 1' : '',
      trial2: trialData.trial2 ? 'Trial 2' : ''
    };
  }

  /**
   * Extracts input dependencies from trial data
   */
  private extractInputs(trialData: { [key: string]: { dataRef: string; value: string } }): string[] {
    const inputs = new Set<string>();
    
    Object.values(trialData).forEach(trial => {
      if (trial.value.startsWith('=')) {
        const cellRefRegex = /[A-Z]+\d+/g;
        const matches = trial.value.match(cellRefRegex);
        if (matches) {
          matches.forEach(match => inputs.add(match));
        }
      }
      
      // Also extract from dataRef if it's a cell reference (without = prefix)
      if (trial.dataRef && /^[A-Z]+\d+$/.test(trial.dataRef)) {
        inputs.add(trial.dataRef);
      }
    });
    
    return Array.from(inputs);
  }

  /**
   * Parses a CSV line handling quoted values
   */
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

  /**
   * Parses numeric values
   */
  private parseNumericValue(value: string): number | null {
    if (!value || value.startsWith('=')) return null;
    
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Cleans label text
   */
  private cleanLabel(label: string): string {
    // Don't remove numbers at the beginning - they're part of the label
    return label.trim();
  }

  /**
   * Cleans subsection title
   */
  private cleanSubsectionTitle(subsection: string): string {
    return subsection.replace(/^\d+[a-z]\s*/, '').trim();
  }
}
