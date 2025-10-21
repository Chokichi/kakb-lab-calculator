import React from 'react';
import { CalculationRow } from '../types';

interface CalculatorRowProps {
  row: CalculationRow;
  onValueChange: (id: string, trial: 'trial1' | 'trial2', value: number | null) => void;
}

export const CalculatorRow: React.FC<CalculatorRowProps> = ({ row, onValueChange }) => {
  const handleInputChange = (trial: 'trial1' | 'trial2') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? null : parseFloat(value);
    onValueChange(row.id, trial, numericValue);
  };

  const getStatusIcon = (trial: 'trial1' | 'trial2') => {
    // Only show status if the row has been checked
    if (!row.isChecked) return null;
    
    const isCorrect = trial === 'trial1' ? row.isCorrectTrial1 : row.isCorrectTrial2;
    const isClose = trial === 'trial1' ? row.isCloseTrial1 : row.isCloseTrial2;
    
    if (isCorrect === null && isClose === null) return null;
    if (isCorrect) return '✅';
    if (isClose) return '⚠️';
    return '❌';
  };

  const getInputClassName = (trial: 'trial1' | 'trial2') => {
    // Only apply status styling if the row has been checked
    if (!row.isChecked) return 'trial-input';
    
    const isCorrect = trial === 'trial1' ? row.isCorrectTrial1 : row.isCorrectTrial2;
    const isClose = trial === 'trial1' ? row.isCloseTrial1 : row.isCloseTrial2;
    
    if (isCorrect === null && isClose === null) return 'trial-input';
    if (isCorrect) return 'trial-input correct';
    if (isClose) return 'trial-input close';
    return 'trial-input incorrect';
  };

  const getInputType = () => {
    if (row.label.toLowerCase().includes('ph')) return 'pH';
    if (row.label.toLowerCase().includes('grams')) return 'Mass';
    if (row.label.toLowerCase().includes('keq')) return 'Keq';
    if (row.label.toLowerCase().includes('unknown #')) return 'Unknown #';
    if (row.label.toLowerCase().includes('[') && row.label.toLowerCase().includes(']')) return 'Concentration';
    return 'Value';
  };

  const getPlaceholder = () => {
    if (row.label.toLowerCase().includes('ph')) return 'e.g., 2.48';
    if (row.label.toLowerCase().includes('grams')) return 'e.g., 0.5293';
    if (row.label.toLowerCase().includes('keq')) return 'e.g., 2.19e-5';
    if (row.label.toLowerCase().includes('unknown #')) return 'e.g., 1';
    return 'Enter value';
  };

  return (
    <div className="calculator-row">
      <div className="row-label">
        <span className="input-type-badge">{getInputType()}</span>
        {row.label}
        {row.isDirectInput && <span className="required-indicator">*</span>}
      </div>
      
      <div className="row-inputs">
        <div className="trial-inputs">
          <div className="trial-label">Trial 1</div>
          <div className="trial-input-wrapper">
            <input
              type="number"
              step="any"
              value={row.studentValueTrial1 || ''}
              onChange={handleInputChange('trial1')}
              placeholder={getPlaceholder()}
              disabled={!row.isDirectInput}
              className={getInputClassName('trial1')}
            />
            <div className="trial-status">
              {getStatusIcon('trial1')}
            </div>
          </div>
        </div>
        
        <div className="trial-inputs">
          <div className="trial-label">Trial 2</div>
          <div className="trial-input-wrapper">
            <input
              type="number"
              step="any"
              value={row.studentValueTrial2 || ''}
              onChange={handleInputChange('trial2')}
              placeholder={getPlaceholder()}
              disabled={!row.isDirectInput}
              className={getInputClassName('trial2')}
            />
            <div className="trial-status">
              {getStatusIcon('trial2')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row-unit">
        {row.unit}
      </div>
    </div>
  );
};
