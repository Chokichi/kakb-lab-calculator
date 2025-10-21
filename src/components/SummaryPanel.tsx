import React from 'react';
import { CalculationRow } from '../types';

interface SummaryPanelProps {
  rows: CalculationRow[];
  onReset: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  rows,
  onReset,
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

  const completionPercentage = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
  const accuracyPercentage = completedRows > 0 ? Math.round((correctRows / completedRows) * 100) : 0;

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <h2>Lab Progress Summary</h2>
        <button className="reset-button" onClick={onReset}>
          Reset All
        </button>
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
          <span className="stat-detail">({correctRows}/{completedRows})</span>
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
      
      <div className="tolerance-info">
        <div className="stat-item">
          <span className="stat-label">Tolerance:</span>
          <span className="stat-value">10%</span>
          <span className="stat-detail">(Fixed)</span>
        </div>
      </div>
    </div>
  );
};
