import React, { useState } from 'react';
import { calculators, CalculatorConfig } from '../config/calculators';

interface CalculatorSelectorProps {
  currentCalculator: CalculatorConfig;
  onCalculatorChange: (calculator: CalculatorConfig) => void;
}

export const CalculatorSelector: React.FC<CalculatorSelectorProps> = ({
  currentCalculator,
  onCalculatorChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
              {calculators.map((calculator) => (
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
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="calculator-info">
        <p>{currentCalculator.description}</p>
      </div>
    </div>
  );
};
