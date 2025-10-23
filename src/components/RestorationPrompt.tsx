import React, { useEffect } from 'react';
import { LocalStorageManager } from '../utils/localStorage';

interface RestorationPromptProps {
  onRestore: () => void;
  onStartFresh: () => void;
  onClose: () => void;
}

export const RestorationPrompt: React.FC<RestorationPromptProps> = ({
  onRestore,
  onStartFresh,
  onClose
}) => {
  const savedTimestamp = LocalStorageManager.getSavedTimestamp();
  const formattedTime = savedTimestamp ? LocalStorageManager.formatTimestamp(savedTimestamp) : 'Unknown';

  // Lock body scroll when modal is open and ensure proper positioning
  useEffect(() => {
    document.body.classList.add('modal-open');
    
    // Force scroll to top to ensure modal is visible
    window.scrollTo(0, 0);
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="restoration-overlay">
      <div className="restoration-modal">
        <div className="restoration-header">
          <h3>Welcome Back!</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="restoration-content">
          <p>We found saved data from your previous session:</p>
          <div className="saved-info">
            <strong>Last saved:</strong> {formattedTime}
          </div>
          
          <p>Would you like to restore your previous work or start fresh?</p>
        </div>
        
        <div className="restoration-actions">
          <button 
            className="btn btn-primary" 
            onClick={onRestore}
          >
            Restore Previous Work
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onStartFresh}
          >
            Start Fresh
          </button>
        </div>
        
        <div className="restoration-note">
          <small>
            💡 Your work is automatically saved as you type. You can always start fresh later.
          </small>
        </div>
      </div>
    </div>
  );
};
