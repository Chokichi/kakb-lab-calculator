import React, { useState } from 'react';
import { CalculationRow } from '../types';

interface CalculatorRowProps {
  row: CalculationRow;
  onValueChange: (id: string, trial: 'trial1' | 'trial2', value: number | null) => void;
  onChoiceChange: (id: string, trial: 'trial1' | 'trial2', choice: string | null) => void;
  allRows: CalculationRow[]; // Add this to find dependent rows
  isSingleColumn?: boolean; // Whether this is a single-column layout
}

export const CalculatorRow: React.FC<CalculatorRowProps> = ({ row, onValueChange, onChoiceChange, allRows, isSingleColumn = false }) => {
  const [showTooltip, setShowTooltip] = useState<{ trial: 'trial1' | 'trial2' | null }>({ trial: null });

  const handleInputChange = (trial: 'trial1' | 'trial2') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? null : parseFloat(value);
    onValueChange(row.id, trial, numericValue);
  };

  const handleChoiceChange = (trial: 'trial1' | 'trial2') => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const choice = e.target.value === '' ? null : e.target.value;
    onChoiceChange(row.id, trial, choice);
  };

  // Helper function to find rows that correspond to missing dependencies
  const findDependentRows = (missingDeps: string[]) => {
    return missingDeps.map(dep => {
      const dependentRow = allRows.find(r => r.trial1DataTag === dep || r.trial2DataTag === dep);
      return dependentRow ? { row: dependentRow, dataTag: dep } : null;
    }).filter(Boolean);
  };

  // Helper function to get tooltip content
  const getTooltipContent = (trial: 'trial1' | 'trial2') => {
    const missingDeps = trial === 'trial1' ? row.missingDependenciesTrial1 : row.missingDependenciesTrial2;
    if (missingDeps.length === 0) return null;
    
    const dependentRows = findDependentRows(missingDeps);
    return (
      <div className="dependency-tooltip">
        <div className="tooltip-header">Missing dependencies:</div>
        <div className="tooltip-content">
          {dependentRows.map((dep, index) => (
            <div key={index} className="dependency-item">
              • {dep?.row.label} ({dep?.dataTag})
            </div>
          ))}
        </div>
      </div>
    );
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
    let className = 'trial-input';
    
    // Add dependency warning class if there are missing dependencies
    const canCalculate = trial === 'trial1' ? row.canCalculateTrial1 : row.canCalculateTrial2;
    if (!canCalculate) {
      className += ' missing-dependencies';
    }
    
    // Only apply status styling if the row has been checked
    if (!row.isChecked) return className;
    
    const isCorrect = trial === 'trial1' ? row.isCorrectTrial1 : row.isCorrectTrial2;
    const isClose = trial === 'trial1' ? row.isCloseTrial1 : row.isCloseTrial2;
    
    if (isCorrect === null && isClose === null) return className;
    if (isCorrect) return className + ' correct';
    if (isClose) return className + ' close';
    return className + ' incorrect';
  };


  const getPlaceholder = () => {
    if (row.label.toLowerCase().includes('ph')) return 'e.g., 2.48';
    if (row.label.toLowerCase().includes('grams')) return 'e.g., 0.5293';
    if (row.label.toLowerCase().includes('keq')) return 'e.g., 2.19e-5';
    if (row.label.toLowerCase().includes('unknown #')) return 'e.g., 1';
    return 'Enter value';
  };

  return (
    <div className={`calculator-row ${isSingleColumn ? 'single-column' : ''}`}>
      <div className="row-label">
        {row.label}
        {row.isDirectInput && <span className="required-indicator">*</span>}
      </div>
      
      <div className={`row-inputs ${isSingleColumn ? 'single-column' : ''}`}>
        {row.trial1DataTag && (
          <div className="trial-inputs">
            <div className="trial-label">Trial 1</div>
            <div className="trial-input-wrapper">
              <div className="input-container">
                {row.entryType === 'Choice' ? (
                  <select
                    value={row.studentChoiceTrial1 || ''}
                    onChange={handleChoiceChange('trial1')}
                    disabled={!row.shouldAllowInput}
                    className={getInputClassName('trial1')}
                    onMouseEnter={() => setShowTooltip({ trial: 'trial1' })}
                    onMouseLeave={() => setShowTooltip({ trial: null })}
                  >
                    <option value="">Select option...</option>
                    {row.choiceOptionsTrial1?.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    value={row.studentValueTrial1 !== null ? row.studentValueTrial1 : ''}
                    onChange={handleInputChange('trial1')}
                    placeholder={getPlaceholder()}
                    disabled={!row.shouldAllowInput}
                    className={getInputClassName('trial1')}
                    onMouseEnter={() => setShowTooltip({ trial: 'trial1' })}
                    onMouseLeave={() => setShowTooltip({ trial: null })}
                  />
                )}
                {showTooltip.trial === 'trial1' && getTooltipContent('trial1')}
              </div>
              <div className="trial-status">
                {getStatusIcon('trial1')}
              </div>
            </div>
          </div>
        )}
        
        {row.trial2DataTag && (
          <div className="trial-inputs">
            <div className="trial-label">Trial 2</div>
            <div className="trial-input-wrapper">
              <div className="input-container">
                {row.entryType === 'Choice' ? (
                  <select
                    value={row.studentChoiceTrial2 || ''}
                    onChange={handleChoiceChange('trial2')}
                    disabled={!row.shouldAllowInput}
                    className={getInputClassName('trial2')}
                    onMouseEnter={() => setShowTooltip({ trial: 'trial2' })}
                    onMouseLeave={() => setShowTooltip({ trial: null })}
                  >
                    <option value="">Select option...</option>
                    {row.choiceOptionsTrial2?.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    value={row.studentValueTrial2 !== null ? row.studentValueTrial2 : ''}
                    onChange={handleInputChange('trial2')}
                    placeholder={getPlaceholder()}
                    disabled={!row.shouldAllowInput}
                    className={getInputClassName('trial2')}
                    onMouseEnter={() => setShowTooltip({ trial: 'trial2' })}
                    onMouseLeave={() => setShowTooltip({ trial: null })}
                  />
                )}
                {showTooltip.trial === 'trial2' && getTooltipContent('trial2')}
              </div>
              <div className="trial-status">
                {getStatusIcon('trial2')}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="row-unit">
        {row.unit}
      </div>
    </div>
  );
};
