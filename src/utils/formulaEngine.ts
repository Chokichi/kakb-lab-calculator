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
   * Converts Excel-style cell references to variable names
   * This now directly uses the cell references as they appear in the formulas
   */
  private convertCellReference(cellRef: string): string {
    // For now, just return the cell reference as-is since we're mapping them directly
    // in the calculator store
    return cellRef;
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
