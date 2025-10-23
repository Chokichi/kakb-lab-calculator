import { getCalculatorById, getDefaultCalculator, CalculatorConfig } from '../config/calculators';

/**
 * Gets the calculator ID from URL parameters
 */
export const getCalculatorFromURL = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('calculator') || '';
};

/**
 * Gets the calculator configuration from URL or defaults
 */
export const getCalculatorConfigFromURL = (): CalculatorConfig => {
  const calculatorId = getCalculatorFromURL();
  const calculator = calculatorId ? getCalculatorById(calculatorId) : null;
  return calculator || getDefaultCalculator();
};

/**
 * Updates the URL with a new calculator ID
 */
export const updateURLWithCalculator = (calculatorId: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('calculator', calculatorId);
  window.history.pushState({}, '', url.toString());
};

/**
 * Listens for URL changes (back/forward navigation)
 */
export const onURLChange = (callback: (calculator: CalculatorConfig) => void): (() => void) => {
  const handlePopState = () => {
    const calculator = getCalculatorConfigFromURL();
    callback(calculator);
  };

  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => window.removeEventListener('popstate', handlePopState);
};
