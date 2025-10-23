export interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  csvFile: string;
  icon?: string;
  color?: string;
}

export const calculators: CalculatorConfig[] = [
  {
    id: 'titration',
    name: 'Titration of a Diprotic Acid',
    description: 'Single-trial titration calculations with equivalence points',
    csvFile: '/Titration_HeaderBased.csv',
    icon: '🧪',
    color: '#4CAF50'
  },
  {
    id: 'kakb',
    name: 'Determination of Ka and Kb',
    description: 'Dual-trial acid-base equilibrium calculations',
    csvFile: '/KaKb_HeaderBased.csv',
    icon: '⚗️',
    color: '#2196F3'
  }
];

export const getCalculatorById = (id: string): CalculatorConfig | undefined => {
  return calculators.find(calc => calc.id === id);
};

export const getDefaultCalculator = (): CalculatorConfig => {
  return calculators[0]; // Default to titration
};
