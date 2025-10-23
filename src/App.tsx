import { useEffect, useState } from 'react';
import { useCalculatorStore } from './store/calculatorStore';
import { CalculatorGrid } from './components/CalculatorGrid';
import { SummaryPanel } from './components/SummaryPanel';
import { CalculatorSelector } from './components/CalculatorSelector';
import { getCalculatorConfigFromURL, onURLChange } from './utils/urlUtils';
import { CalculatorConfig } from './config/calculators';
import './App.css';

function App() {
  const {
    rows,
    title,
    isLoading,
    error,
    setStudentValue,
    setStudentChoice,
    setStudentText,
    resetAll,
    checkWork,
    resetSubsection,
    switchCalculator,
  } = useCalculatorStore();

  const [currentCalculator, setCurrentCalculator] = useState<CalculatorConfig>(getCalculatorConfigFromURL());

  // Load calculator data on app start and when calculator changes
  useEffect(() => {
    switchCalculator(currentCalculator);
  }, [currentCalculator, switchCalculator]);

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    const cleanup = onURLChange((calculator) => {
      setCurrentCalculator(calculator);
    });
    return cleanup;
  }, []);

  // Handle calculator switching
  const handleCalculatorChange = (calculator: CalculatorConfig) => {
    setCurrentCalculator(calculator);
  };

  if (error) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {currentCalculator.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <CalculatorSelector 
        currentCalculator={currentCalculator}
        onCalculatorChange={handleCalculatorChange}
      />
      
      <header className="app-header">
        <h1>{title}</h1>
        <p>Enter your measured and calculated concentrations to check your work</p>
        <div className="instructions">
          <p><strong>Instructions:</strong></p>
          <ul>
            <li>Enter your <strong>measured and calculated values</strong> to check your work</li>
            <li>Green checkmarks ✅ indicate correct values within tolerance</li>
            <li>Red X marks ❌ indicate values outside acceptable range</li>
            <li>You can use scientific notation for values (e.g. 1.0E-3 for 0.001)</li>
          </ul>
        </div>
      </header>
      
      <div className="app-content">
        <div className="main-content">
          <CalculatorGrid 
            rows={rows} 
            onValueChange={setStudentValue}
            onChoiceChange={setStudentChoice}
            onTextChange={setStudentText}
            onCheckWork={checkWork}
            onResetSubsection={resetSubsection}
          />
        </div>
        
        <div className="sidebar">
          <SummaryPanel
            rows={rows}
            onReset={resetAll}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

export default App;