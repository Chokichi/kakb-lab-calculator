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
    // Return the cell reference as-is since we're mapping them directly
    // in the calculator store using data tags
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

    // Convert Excel functions to JavaScript equivalents FIRST
    jsFormula = jsFormula.replace(/SUM\(([^)]+)\)/g, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `(${values.join(' + ')})`;
    });
    jsFormula = jsFormula.replace(/AVERAGE\(([^)]+)\)/g, (_match, args) => {
      const values = args.split(',').map((v: string) => v.trim());
      return `(${values.join(' + ')}) / ${values.length}`;
    });
    
    // Handle range notation like F43:G43 (convert to individual values)
    jsFormula = jsFormula.replace(/([A-Z]+\d+):([A-Z]+\d+)/g, (_match, start) => {
      // For ranges, we'll just use the start value for now
      // In a full implementation, this would expand to all cells in the range
      return start;
    });

    // Convert Excel cell references to variable names (keep as-is for now)
    const cellRefRegex = /[A-Z]+\d+/g;
    jsFormula = jsFormula.replace(cellRefRegex, (match) => {
      return this.convertCellReference(match);
    });

      // Convert Excel operators to JavaScript
      // mathjs uses ^ for power, not **, so we don't need to convert it
      // Just ensure proper parentheses for complex expressions
      
      // Handle power operations with proper parentheses
      // First handle the specific case of 10^-(expression) without parentheses
      jsFormula = jsFormula.replace(/(\d+)\^-\(([^)]+)\)/g, '($1 ^ (-($2)))');
      jsFormula = jsFormula.replace(/(\d+)\^-([A-Z]+\d+)/g, '($1 ^ (-$2))');
      
      // Handle other power operations
      jsFormula = jsFormula.replace(/(\d+)\^\(-([^)]+)\)/g, '($1 ^ (-($2)))');
      jsFormula = jsFormula.replace(/(\d+)\^\(([^)]+)\)/g, '($1 ^ ($2))');
      jsFormula = jsFormula.replace(/(\d+)\^([A-Z]+\d+)/g, '($1 ^ $2)');
      jsFormula = jsFormula.replace(/([A-Z]+\d+)\^\(-([^)]+)\)/g, '($1 ^ (-($2)))');
      jsFormula = jsFormula.replace(/([A-Z]+\d+)\^\(([^)]+)\)/g, '($1 ^ ($2))');
      jsFormula = jsFormula.replace(/([A-Z]+\d+)\^([A-Z]+\d+)/g, '($1 ^ $2)');
      
      // Handle simple power operations that might not have been caught
      jsFormula = jsFormula.replace(/(\d+)\^(\d+)/g, '($1 ^ $2)');
      jsFormula = jsFormula.replace(/([A-Z]+\d+)\^(\d+)/g, '($1 ^ $2)');
      
      jsFormula = jsFormula.replace(/\*/g, '*'); // Multiplication
      jsFormula = jsFormula.replace(/\//g, '/'); // Division
      jsFormula = jsFormula.replace(/\+/g, '+'); // Addition
      jsFormula = jsFormula.replace(/-/g, '-'); // Subtraction

    return jsFormula;
  }

  /**
   * Cleans up malformed expressions that might cause syntax errors
   */
  private cleanFormula(formula: string): string {
    let cleaned = formula;
    
    // Only remove truly empty parentheses, not nested ones
    cleaned = cleaned.replace(/\(\s*\)/g, '');
    
    // Fix issues with consecutive operators
    cleaned = cleaned.replace(/\+\s*\+/g, '+');
    cleaned = cleaned.replace(/\-\s*\-/g, '+');
    cleaned = cleaned.replace(/\+\s*\-/g, '-');
    cleaned = cleaned.replace(/\-\s*\+/g, '-');
    
    return cleaned;
  }

  /**
   * Evaluates a formula with given inputs
   */
  evaluateFormula(formula: string, inputs: { [key: string]: number }): number | null {
    try {
      let jsFormula = this.convertFormula(formula);
      
      
      // Replace cell references with actual values
      Object.keys(inputs).forEach(cellRef => {
        const regex = new RegExp(cellRef, 'g');
        jsFormula = jsFormula.replace(regex, inputs[cellRef].toString());
      });
      
      
      // Check if there are any remaining cell references that weren't replaced
      const remainingRefs = jsFormula.match(/[A-Z]+\d+/g);
      if (remainingRefs && remainingRefs.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Unresolved cell references:', remainingRefs);
        }
        return null; // Don't evaluate if there are missing dependencies
      }
      
      // Clean up any malformed expressions
      jsFormula = this.cleanFormula(jsFormula);
      
      
      // Validate parentheses balance before evaluation
      const openParens = (jsFormula.match(/\(/g) || []).length;
      const closeParens = (jsFormula.match(/\)/g) || []).length;
      
      
      if (openParens !== closeParens) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Mismatched parentheses:', { 
            openParens, 
            closeParens, 
            formula: jsFormula,
            originalFormula: formula 
          });
        }
        return null;
      }
      
      const result = evaluate(jsFormula);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Formula evaluation error:', error);
        console.error('Formula:', formula);
        console.error('Inputs:', inputs);
      }
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
