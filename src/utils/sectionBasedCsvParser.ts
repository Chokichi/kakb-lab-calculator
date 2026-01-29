import { CalculationRow } from '../types';

interface LabParameters {
  title: string;
  warningTolerance: number;
  incorrectTolerance: number;
  trials: number;
}

interface ColumnMapping {
  section: number;
  subsection: number;
  label: number;
  unit: number;
  entryType: number;
  dataRefs: number[];  // DataRef1, DataRef2, etc.
  trials: number[];    // Trial 1, Trial 2, etc.
}

export class SectionBasedCSVParser {
  constructor() {
    // Section-based parser for CSV files with \Start and \End markers
  }

  /**
   * Main parsing method - handles the full CSV with section markers
   */
  parseCSV(csvData: string): { rows: CalculationRow[], title: string, tolerance1: number, tolerance2: number } {
    const lines = csvData.split('\n').map(line => line.trim());
    
    // Find section boundaries
    const paramStartIndex = lines.findIndex(line => line.toLowerCase().startsWith('\\start parameters'));
    const paramEndIndex = lines.findIndex(line => line.toLowerCase().startsWith('\\end parameters'));
    const tableStartIndex = lines.findIndex(line => line.toLowerCase().startsWith('\\start table'));
    
    // Parse parameters section
    let parameters: LabParameters = {
      title: 'Lab Calculator',
      warningTolerance: 0.05,
      incorrectTolerance: 0.1,
      trials: 2
    };
    
    if (paramStartIndex !== -1 && paramEndIndex !== -1) {
      parameters = this.parseParameters(lines.slice(paramStartIndex + 1, paramEndIndex));
    }
    
    // Parse table section
    let rows: CalculationRow[] = [];
    if (tableStartIndex !== -1) {
      rows = this.parseTable(lines.slice(tableStartIndex + 1), parameters.trials);
    }
    
    return {
      rows,
      title: parameters.title,
      tolerance1: parameters.warningTolerance,
      tolerance2: parameters.incorrectTolerance
    };
  }

  /**
   * Parses the parameters section (between \Start Parameters and \End Parameters)
   */
  private parseParameters(lines: string[]): LabParameters {
    const params: LabParameters = {
      title: 'Lab Calculator',
      warningTolerance: 0.05,
      incorrectTolerance: 0.1,
      trials: 2
    };

    for (const line of lines) {
      if (!line || line.trim() === '') continue;
      
      const columns = this.parseCSVLine(line);
      const key = columns[0]?.toLowerCase().trim();
      const value = columns[1]?.trim();
      
      if (!key || !value) continue;
      
      switch (key) {
        case 'title':
          params.title = value;
          break;
        case 'warning tolerance':
          params.warningTolerance = parseFloat(value) || 0.05;
          break;
        case 'incorrect tolerance':
          params.incorrectTolerance = parseFloat(value) || 0.1;
          break;
        case 'trials':
          params.trials = parseInt(value) || 2;
          break;
      }
    }

    return params;
  }

  /**
   * Parses the table section (after \Start Table)
   */
  private parseTable(lines: string[], numTrials: number): CalculationRow[] {
    const rows: CalculationRow[] = [];
    let currentSection = '';
    let currentSubsection = '';
    
    // First line should be the header row
    if (lines.length === 0) return rows;
    
    const headerRow = this.parseCSVLine(lines[0]);
    const columnMapping = this.detectColumnStructure(headerRow);
    
    // Validate required columns
    if (columnMapping.label === -1 || columnMapping.entryType === -1) {
      throw new Error('Missing required columns: Label or Entry Type');
    }

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') continue;
      
      const columns = this.parseCSVLine(line);
      
      // Extract section and subsection
      const section = columnMapping.section >= 0 ? columns[columnMapping.section]?.trim() : '';
      const subsection = columnMapping.subsection >= 0 ? columns[columnMapping.subsection]?.trim() : '';
      const label = columnMapping.label >= 0 ? columns[columnMapping.label]?.trim() : '';
      
      // Handle section headers (row has section name but no label/data)
      if (section && !label && !this.hasDataContent(columns, columnMapping)) {
        currentSection = section;
        currentSubsection = '';
        continue;
      }
      
      // Handle subsection headers
      if (!section && subsection && !label && !this.hasDataContent(columns, columnMapping)) {
        currentSubsection = subsection;
        continue;
      }
      
      // Skip rows without labels
      if (!label) continue;
      
      // Create calculation row
      const row = this.createCalculationRow(
        `row-${i}`,
        columns,
        columnMapping,
        currentSection,
        currentSubsection,
        numTrials
      );
      
      if (row) {
        rows.push(row);
      }
    }

    return rows;
  }

  /**
   * Detects column structure from the header row
   */
  private detectColumnStructure(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
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
      
      if (lower === 'section') mapping.section = index;
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
   * Checks if a row has actual data content (not just a section header)
   */
  private hasDataContent(columns: string[], mapping: ColumnMapping): boolean {
    // Check if any trial column has content
    return mapping.trials.some(index => 
      index < columns.length && columns[index] && columns[index].trim() !== ''
    );
  }

  /**
   * Creates a CalculationRow from parsed CSV data
   */
  private createCalculationRow(
    id: string,
    columns: string[],
    mapping: ColumnMapping,
    section: string,
    subsection: string,
    _numTrials: number  // Prefixed with underscore to indicate intentionally unused (available for future use)
  ): CalculationRow | null {
    const label = columns[mapping.label]?.trim() || '';
    const unit = mapping.unit >= 0 ? columns[mapping.unit]?.trim() || '' : '';
    const entryType = mapping.entryType >= 0 ? columns[mapping.entryType]?.trim() || 'Data' : 'Data';

    // Build trial data by pairing DataRef columns with Trial columns
    const trialData: { [key: string]: { dataRef: string; value: string } } = {};
    
    for (let t = 0; t < Math.min(mapping.dataRefs.length, mapping.trials.length); t++) {
      const dataRefIndex = mapping.dataRefs[t];
      const trialIndex = mapping.trials[t];
      
      let dataRef = dataRefIndex < columns.length ? columns[dataRefIndex]?.trim() || '' : '';
      let value = trialIndex < columns.length ? columns[trialIndex]?.trim() || '' : '';
      
      // Strip = prefix from dataRef (e.g., =F14 -> F14)
      if (dataRef.startsWith('=')) {
        dataRef = dataRef.substring(1);
      }
      
      // Handle NA values - treat as empty for input purposes
      const isNA = value.toUpperCase() === 'NA';
      
      if (dataRef) {
        trialData[`trial${t + 1}`] = {
          dataRef,
          value: isNA ? '' : value
        };
      }
    }

    // Determine entry behavior
    const isDirectInput = entryType === 'Data' || entryType === 'Choice' || entryType === 'Text';
    const shouldAllowInput = ['Data', 'Calculated', 'Calculation', 'Choice', 'Text'].includes(entryType);

    // Parse choice options for Choice entry type
    const choiceOptions: { [key: string]: string[] } = {};
    if (entryType === 'Choice') {
      Object.keys(trialData).forEach(trialKey => {
        const trial = trialData[trialKey];
        if (trial.value && trial.value.includes(';')) {
          choiceOptions[trialKey] = trial.value.split(';').map(opt => opt.trim());
        }
      });
    }

    // Extract formulas (values starting with =)
    const formula: { [key: string]: string | null } = {};
    Object.keys(trialData).forEach(trialKey => {
      const trial = trialData[trialKey];
      formula[trialKey] = trial.value.startsWith('=') ? trial.value : null;
    });

    // Parse expected values for non-formula values
    const expectedValues: { [key: string]: number | null } = {};
    Object.keys(trialData).forEach(trialKey => {
      const trial = trialData[trialKey];
      if (!trial.value.startsWith('=') && entryType !== 'Choice' && entryType !== 'Text') {
        const numValue = parseFloat(trial.value);
        expectedValues[trialKey] = isNaN(numValue) ? null : numValue;
      }
    });

    // Determine if trials have input capability
    const trial1HasInput = Boolean(
      trialData.trial1?.dataRef && 
      trialData.trial1?.value !== '' && 
      trialData.trial1?.value.toUpperCase() !== 'NA'
    );
    const trial2HasInput = Boolean(
      trialData.trial2?.dataRef && 
      trialData.trial2?.value !== '' && 
      trialData.trial2?.value.toUpperCase() !== 'NA'
    );

    // Build the calculation row
    const row: CalculationRow = {
      id,
      label,
      unit,
      formula: Object.keys(formula).some(k => formula[k]) ? formula as any : null,
      inputs: this.extractInputs(trialData),
      tolerance: 0.10,
      studentValueTrial1: null,
      studentValueTrial2: null,
      // For rows with formulas, computed values should be null initially
      // They will be calculated based on dependencies, not from placeholder values
      computedValueTrial1: formula.trial1 ? null : (expectedValues.trial1 ?? null),
      computedValueTrial2: formula.trial2 ? null : (expectedValues.trial2 ?? null),
      isCorrectTrial1: null,
      isCorrectTrial2: null,
      isCloseTrial1: null,
      isCloseTrial2: null,
      isDirectInput,
      shouldAllowInput,
      isChecking: false,
      isChecked: false,
      section: section || 'Default',
      subsection: subsection || '',
      trial1Value: expectedValues.trial1 ?? undefined,
      trial2Value: expectedValues.trial2 ?? undefined,
      trial1DataTag: trialData.trial1?.dataRef || '',
      trial2DataTag: trialData.trial2?.dataRef || '',
      trial1HasInput,
      trial2HasInput,
      missingDependenciesTrial1: [],
      missingDependenciesTrial2: [],
      canCalculateTrial1: !formula.trial1,
      canCalculateTrial2: !formula.trial2,
      entryType,
      choiceOptionsTrial1: choiceOptions.trial1,
      choiceOptionsTrial2: choiceOptions.trial2,
      studentChoiceTrial1: null,
      studentChoiceTrial2: null,
      studentTextTrial1: null,
      studentTextTrial2: null,
      columnHeaders: {
        trial1: trialData.trial1 ? 'Trial 1' : '',
        trial2: trialData.trial2 ? 'Trial 2' : ''
      }
    };

    return row;
  }

  /**
   * Extracts cell reference dependencies from trial formulas
   */
  private extractInputs(trialData: { [key: string]: { dataRef: string; value: string } }): string[] {
    const inputs = new Set<string>();
    
    Object.values(trialData).forEach(trial => {
      // Extract cell references from formulas
      if (trial.value.startsWith('=')) {
        const cellRefRegex = /[A-Z]+\d+/g;
        const matches = trial.value.match(cellRefRegex);
        if (matches) {
          matches.forEach(match => inputs.add(match));
        }
      }
      
      // Also include dataRef if it's a plain cell reference
      if (trial.dataRef && /^[A-Z]+\d+$/.test(trial.dataRef)) {
        inputs.add(trial.dataRef);
      }
    });
    
    return Array.from(inputs);
  }

  /**
   * Parses a CSV line, handling quoted values with commas
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
   * Static method to check if a CSV uses the section-based format
   */
  static isSectionBasedFormat(csvData: string): boolean {
    const lowerData = csvData.toLowerCase();
    return lowerData.includes('\\start parameters') && lowerData.includes('\\start table');
  }
}
