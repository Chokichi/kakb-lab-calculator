import React, { useRef } from 'react';

interface FileLoaderProps {
  onFileLoad: (content: string) => void;
  isLoading: boolean;
}

export const FileLoader: React.FC<FileLoaderProps> = ({ onFileLoad, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.readAsText(file);
  };

  const handleLoadDefault = () => {
    // Load the default CSV data
    fetch('/Excel Logic/KaKb Key Calculator.csv')
      .then(response => response.text())
      .then(content => onFileLoad(content))
      .catch(error => console.error('Error loading default data:', error));
  };

  return (
    <div className="file-loader">
      <div className="file-loader-content">
        <h2>Ka/Kb Lab Calculator</h2>
        <p>Load your lab data to start checking calculations</p>
        
        <div className="file-loader-actions">
          <button 
            className="load-default-button"
            onClick={handleLoadDefault}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load Default Data'}
          </button>
          
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              className="load-file-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Load CSV File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
