import React from 'react';
import { CalculationRow } from '../types';
import { PDFButton } from './PDFButton';

interface SummaryPanelProps {
  rows: CalculationRow[];
  onReset: () => void;
  title: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  rows,
  onReset,
  title,
}) => {
  const totalRows = rows.length;
  const completedRows = rows.filter(row => 
    row.studentValueTrial1 !== null || row.studentValueTrial2 !== null
  ).length;
  const correctRows = rows.filter(row => 
    row.isCorrectTrial1 === true || row.isCorrectTrial2 === true
  ).length;
  const closeRows = rows.filter(row => 
    row.isCloseTrial1 === true || row.isCloseTrial2 === true
  ).length;
  const incorrectRows = rows.filter(row => 
    (row.isCorrectTrial1 === false && row.isCloseTrial1 !== true) || 
    (row.isCorrectTrial2 === false && row.isCloseTrial2 !== true)
  ).length;
  const pendingRows = rows.filter(row => 
    (row.studentValueTrial1 !== null && row.isCorrectTrial1 === null) ||
    (row.studentValueTrial2 !== null && row.isCorrectTrial2 === null)
  ).length;

  // Filter rows for accuracy calculation (only Calculation and Calculated types)
  const calculationRows = rows.filter(row => 
    row.entryType === 'Calculation' || row.entryType === 'Calculated'
  );
  const completedCalculationRows = calculationRows.filter(row => 
    row.studentValueTrial1 !== null || row.studentValueTrial2 !== null
  ).length;
  const correctCalculationRows = calculationRows.filter(row => 
    row.isCorrectTrial1 === true || row.isCorrectTrial2 === true
  ).length;

  const completionPercentage = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
  const accuracyPercentage = completedCalculationRows > 0 ? Math.round((correctCalculationRows / completedCalculationRows) * 100) : 0;

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <h2>Lab Progress Summary</h2>
        <div className="summary-actions">
          <PDFButton rows={rows} title={title} />
          <button className="reset-button" onClick={onReset}>
            Reset All
          </button>
        </div>
      </div>
      
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Completion:</span>
          <span className="stat-value">{completionPercentage}%</span>
          <span className="stat-detail">({completedRows}/{totalRows})</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Accuracy:</span>
          <span className="stat-value">{accuracyPercentage}%</span>
          <span className="stat-detail">({correctCalculationRows}/{completedCalculationRows})</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Correct:</span>
          <span className="stat-value correct">{correctRows}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Close:</span>
          <span className="stat-value close">{closeRows}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Incorrect:</span>
          <span className="stat-value incorrect">{incorrectRows}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value pending">{pendingRows}</span>
        </div>
      </div>
    </div>
  );
};
