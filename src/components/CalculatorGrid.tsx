import React from 'react';
import { CalculationRow } from '../types';
import { CalculatorRow as CalculatorRowComponent } from './CalculatorRow';
import { CheckWorkButton } from './CheckWorkButton';

interface CalculatorGridProps {
  rows: CalculationRow[];
  onValueChange: (id: string, trial: 'trial1' | 'trial2', value: number | null) => void;
  onCheckWork: (subsectionId: string) => void;
  onResetSubsection: (subsectionId: string) => void;
}

export const CalculatorGrid: React.FC<CalculatorGridProps> = ({ 
  rows, 
  onValueChange, 
  onCheckWork, 
  onResetSubsection 
}) => {
  // Group rows by section, then by subsection
  const groupedRows = rows.reduce((acc, row) => {
    const sectionTitle = row.section; // e.g., "The equilibrium constant of acetic acid"
    const subsectionTitle = row.subsection; // e.g., "1b pH of 0.50 M HC2H3O2"

    if (!acc[sectionTitle]) {
      acc[sectionTitle] = {};
    }
    
    if (!acc[sectionTitle][subsectionTitle]) {
      acc[sectionTitle][subsectionTitle] = [];
    }
    acc[sectionTitle][subsectionTitle].push(row);
    return acc;
  }, {} as { [key: string]: { [key: string]: CalculationRow[] } });

  return (
    <div className="calculator-grid">
      {Object.entries(groupedRows).map(([sectionTitle, subsections]) => (
        <div key={sectionTitle} className="section">
          <h2 className="main-section-title">{sectionTitle}</h2>
              {Object.entries(subsections).map(([subsectionTitle, subsectionRows]) => {
                // Check if any row in this subsection is being checked or has been checked
                const isChecking = subsectionRows.some(row => row.isChecking);
                const isChecked = subsectionRows.some(row => row.isChecked);
                
                return (
                  <div key={`${sectionTitle}-${subsectionTitle}`} className="subsection">
                    <div className="subsection-header">
                      <h3 className="subsection-title">{subsectionTitle}</h3>
                      <CheckWorkButton
                        subsectionId={subsectionTitle}
                        isChecking={isChecking}
                        isChecked={isChecked}
                        onCheckWork={onCheckWork}
                        onResetSubsection={onResetSubsection}
                      />
                    </div>
                    <div className="subsection-content">
                      <div className="grid-header">
                        <div className="header-label">Calculation</div>
                        <div className="header-inputs">
                          <div className="header-trial">Trial 1</div>
                          <div className="header-trial">Trial 2</div>
                        </div>
                        <div className="header-unit">Unit</div>
                      </div>
                      {subsectionRows.map((row) => (
                        <CalculatorRowComponent
                          key={row.id}
                          row={row}
                          onValueChange={onValueChange}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
        </div>
      ))}
    </div>
  );
};
