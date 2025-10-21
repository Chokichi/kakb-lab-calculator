import { evaluate } from 'mathjs';

export class FormulaEngine {
  private static instance: FormulaEngine;
  
  static getInstance(): FormulaEngine {
    if (!FormulaEngine.instance) {
      FormulaEngine.instance = new FormulaEngine();
    }
    return FormulaEngine.instance;
  }

  /**
   * Converts Excel-style cell references to variable names based on the actual lab workflow
   * The key insight is that students enter pH values, and we calculate derived values
   */
  private convertCellReference(cellRef: string): string {
    // Map cell references to the actual input variables students should enter
    // The pattern is: B columns = Trial 1, C columns = Trial 2
    const cellMap: { [key: string]: string } = {
      // Part 1b: 0.50 M HC2H3O2 - Students enter pH, we calculate [H+], [C2H3O2-], Keq
      'B4': 'pH_0_50M_HC2H3O2_trial1', 'C4': 'pH_0_50M_HC2H3O2_trial2', // pH values (student input)
      'B6': 'H_plus_0_50M_trial1', 'C6': 'H_plus_0_50M_trial2', // [H+] calculated from pH
      'B7': 'C2H3O2_minus_0_50M_trial1', 'C7': 'C2H3O2_minus_0_50M_trial2', // [C2H3O2-] = [H+]
      'B8': 'HC2H3O2_0_50M_trial1', 'C8': 'HC2H3O2_0_50M_trial2', // [HC2H3O2] = 0.5 (given)
      
      // Part 1c: 0.20 M HC2H3O2 - Students enter pH, we calculate [H+], [C2H3O2-], Keq
      'B12': 'pH_0_20M_HC2H3O2_trial1', 'C12': 'pH_0_20M_HC2H3O2_trial2', // pH values (student input)
      'B14': 'H_plus_0_20M_trial1', 'C14': 'H_plus_0_20M_trial2', // [H+] calculated from pH
      'B15': 'C2H3O2_minus_0_20M_trial1', 'C15': 'C2H3O2_minus_0_20M_trial2', // [C2H3O2-] = [H+]
      'B16': 'HC2H3O2_0_20M_trial1', 'C16': 'HC2H3O2_0_20M_trial2', // [HC2H3O2] = 0.2 (given)
      
      // Part 1d: Mixture with NaC2H3O2 - Students enter grams and pH, we calculate concentrations
      'B21': 'grams_NaC2H3O2_trial1', 'C21': 'grams_NaC2H3O2_trial2', // grams of NaC2H3O2 (student input)
      'B22': 'pH_mixture_trial1', 'C22': 'pH_mixture_trial2', // pH of mixture (student input)
      'B24': 'C2H3O2_minus_mixture_trial1', 'C24': 'C2H3O2_minus_mixture_trial2', // [C2H3O2-] calculated
      'B25': 'HC2H3O2_mixture_trial1', 'C25': 'HC2H3O2_mixture_trial2', // [HC2H3O2] = 0.5 (given)
      
      // Part 2a: Unknown acid - Students enter pH, we calculate [H+], [A-], Keq
      'B38': 'pH_unknown_acid_trial1', 'C38': 'pH_unknown_acid_trial2', // pH of unknown acid (student input)
      'B40': 'H_plus_unknown_trial1', 'C40': 'H_plus_unknown_trial2', // [H+] calculated from pH
      'B41': 'A_minus_unknown_trial1', 'C41': 'A_minus_unknown_trial2', // [A-] = [H+]
      'B42': 'HA_unknown_trial1', 'C42': 'HA_unknown_trial2', // [HA] = 0.1 (given)
      
      // Part 2b: Unknown acid mixture 1 - Students enter pH, we calculate concentrations
      'B47': 'pH_mixture_unknown_1_trial1', 'C47': 'pH_mixture_unknown_1_trial2', // pH of mixture (student input)
      'B49': 'H_plus_mixture_unknown_1_trial1', 'C49': 'H_plus_mixture_unknown_1_trial2', // [H+] calculated
      'B50': 'A_minus_mixture_unknown_1_trial1', 'C50': 'A_minus_mixture_unknown_1_trial2', // [A-] calculated
      'B51': 'HA_mixture_unknown_1_trial1', 'C51': 'HA_mixture_unknown_1_trial2', // [HA] calculated
      
      // Part 2c: Unknown acid mixture 2 - Students enter pH, we calculate concentrations
      'B56': 'pH_mixture_unknown_2_trial1', 'C56': 'pH_mixture_unknown_2_trial2', // pH of mixture (student input)
      'B58': 'H_plus_mixture_unknown_2_trial1', 'C58': 'H_plus_mixture_unknown_2_trial2', // [H+] calculated
      'B59': 'A_minus_mixture_unknown_2_trial1', 'C59': 'A_minus_mixture_unknown_2_trial2', // [A-] calculated
      'B60': 'HA_mixture_unknown_2_trial1', 'C60': 'HA_mixture_unknown_2_trial2', // [HA] calculated
      
      // Part 3a: Unknown base - Students enter pH, we calculate [OH-], [HB+], Keq
      'B68': 'pH_unknown_base_trial1', 'C68': 'pH_unknown_base_trial2', // pH of base (student input)
      'B70': 'OH_minus_base_trial1', 'C70': 'OH_minus_base_trial2', // [OH-] calculated from pH
      'B71': 'HB_plus_base_trial1', 'C71': 'HB_plus_base_trial2', // [HB+] = [OH-]
      'B72': 'B_base_trial1', 'C72': 'B_base_trial2', // [B] = 0.5 (given)
      
      // Part 3b: Base mixture - Students enter pH, we calculate concentrations
      'B77': 'pH_base_mixture_trial1', 'C77': 'pH_base_mixture_trial2', // pH of base mixture (student input)
      'B79': 'OH_minus_base_mixture_trial1', 'C79': 'OH_minus_base_mixture_trial2', // [OH-] calculated
      'B80': 'HB_plus_base_mixture_trial1', 'C80': 'HB_plus_base_mixture_trial2', // [HB+] calculated
      'B81': 'B_base_mixture_trial1', 'C81': 'B_base_mixture_trial2', // [B] calculated
    };

    return cellMap[cellRef] || cellRef;
  }

  /**
   * Converts Excel formula to JavaScript expression
   */
  convertFormula(excelFormula: string): string {
    if (!excelFormula.startsWith('=')) {
      return excelFormula;
    }

    let jsFormula = excelFormula.substring(1); // Remove '='

    // Convert Excel cell references to variable names
    const cellRefRegex = /[A-Z]+\d+/g;
    jsFormula = jsFormula.replace(cellRefRegex, (match) => {
      return this.convertCellReference(match);
    });

    // Convert Excel operators to JavaScript
    jsFormula = jsFormula.replace(/\^/g, '**'); // Power operator
    jsFormula = jsFormula.replace(/\*/g, '*'); // Multiplication
    jsFormula = jsFormula.replace(/\//g, '/'); // Division
    jsFormula = jsFormula.replace(/\+/g, '+'); // Addition
    jsFormula = jsFormula.replace(/-/g, '-'); // Subtraction

    return jsFormula;
  }

  /**
   * Evaluates a formula with given inputs
   */
  evaluateFormula(formula: string, inputs: { [key: string]: number }): number | null {
    try {
      const jsFormula = this.convertFormula(formula);
      const result = evaluate(jsFormula, inputs);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return null;
    }
  }

  /**
   * Checks if a student value is within tolerance of computed value
   */
  isWithinTolerance(studentValue: number, computedValue: number, tolerance: number): boolean {
    if (computedValue === 0) {
      return Math.abs(studentValue) < 1e-10; // Very small tolerance for zero
    }
    return Math.abs(studentValue - computedValue) / Math.abs(computedValue) <= tolerance;
  }
}
