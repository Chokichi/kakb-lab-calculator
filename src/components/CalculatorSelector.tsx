import React, { useState, useMemo } from 'react';
import { calculators, CalculatorConfig, getCalculatorsByLabType } from '../config/calculators';

interface CalculatorSelectorProps {
  currentCalculator: CalculatorConfig;
  onCalculatorChange: (calculator: CalculatorConfig) => void;
}

export const CalculatorSelector: React.FC<CalculatorSelectorProps> = ({
  currentCalculator,
  onCalculatorChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabType, setSelectedLabType] = useState<string>('all');

  // Group calculators by lab type (for future use)
  // const calculatorsByType = useMemo(() => {
  //   const grouped: { [key: string]: CalculatorConfig[] } = { all: calculators };
  //   
  //   calculators.forEach(calc => {
  //     if (calc.labType) {
  //       if (!grouped[calc.labType]) {
  //         grouped[calc.labType] = [];
  //       }
  //       grouped[calc.labType].push(calc);
  //     }
  //   });
  //   
  //   return grouped;
  // }, []);

  const availableLabTypes = useMemo(() => {
    const types = ['all', ...new Set(calculators.map(calc => calc.labType).filter(Boolean))];
    return types;
  }, []);

  const filteredCalculators = useMemo(() => {
    if (selectedLabType === 'all') {
      return calculators;
    }
    return getCalculatorsByLabType(selectedLabType);
  }, [selectedLabType]);

  const handleCalculatorSelect = (calculator: CalculatorConfig) => {
    onCalculatorChange(calculator);
    setIsOpen(false);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('calculator', calculator.id);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="calculator-selector">
      <div className="selector-header">
        <h2>Lab Calculator Platform</h2>
        <div className="lab-type-filter">
          <label htmlFor="lab-type-select">Filter by lab type:</label>
          <select
            id="lab-type-select"
            value={selectedLabType}
            onChange={(e) => setSelectedLabType(e.target.value)}
            className="lab-type-select"
          >
            {availableLabTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Lab Types' : (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown')}
              </option>
            ))}
          </select>
        </div>
        <div className="calculator-dropdown">
          <button
            className="dropdown-trigger"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: currentCalculator.color,
              border: `2px solid ${currentCalculator.color}`,
              color: 'white'
            }}
          >
            <span className="calculator-icon">{currentCalculator.icon}</span>
            <span className="calculator-name">{currentCalculator.name}</span>
            <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
          </button>
          
          {isOpen && (
            <div className="dropdown-menu">
              {filteredCalculators.map((calculator) => (
                <button
                  key={calculator.id}
                  className={`dropdown-item ${calculator.id === currentCalculator.id ? 'active' : ''}`}
                  onClick={() => handleCalculatorSelect(calculator)}
                  style={{
                    borderLeft: `4px solid ${calculator.color}`
                  }}
                >
                  <span className="item-icon">{calculator.icon}</span>
                  <div className="item-content">
                    <div className="item-name">{calculator.name}</div>
                    <div className="item-description">{calculator.description}</div>
                    {calculator.labType && (
                      <div className="item-lab-type">{calculator.labType}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="calculator-info">
        <p>{currentCalculator.description}</p>
        {currentCalculator.labType && (
          <div className="lab-type-badge">
            <span className="badge-label">Lab Type:</span>
            <span className="badge-value">{currentCalculator.labType}</span>
          </div>
        )}
      </div>
    </div>
  );
};
