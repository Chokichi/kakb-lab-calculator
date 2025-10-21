import React from 'react';

interface CheckWorkButtonProps {
  subsectionId: string;
  isChecking: boolean;
  isChecked: boolean;
  onCheckWork: (subsectionId: string) => void;
  onResetSubsection: (subsectionId: string) => void;
}

export const CheckWorkButton: React.FC<CheckWorkButtonProps> = ({
  subsectionId,
  isChecking,
  isChecked,
  onCheckWork,
  onResetSubsection,
}) => {
  const handleClick = () => {
    if (isChecking) return; // Prevent multiple clicks while checking
    
    if (isChecked) {
      onResetSubsection(subsectionId);
    } else {
      onCheckWork(subsectionId);
    }
  };

  const getButtonText = () => {
    if (isChecking) return 'Calculating...';
    if (isChecked) return 'Reset';
    return 'Check Work';
  };

  const getButtonClassName = () => {
    let className = 'check-work-button';
    if (isChecking) className += ' checking';
    if (isChecked) className += ' checked';
    return className;
  };

  return (
    <div className="check-work-container">
      <button
        className={getButtonClassName()}
        onClick={handleClick}
        disabled={isChecking}
      >
        {isChecking && (
          <div className="button-spinner">
            <div className="spinner"></div>
          </div>
        )}
        <span className="button-text">{getButtonText()}</span>
      </button>
    </div>
  );
};
