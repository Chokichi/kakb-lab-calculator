import { useEffect } from 'react';
import { useCalculatorStore } from './store/calculatorStore';
import { CalculatorGrid } from './components/CalculatorGrid';
import { SummaryPanel } from './components/SummaryPanel';
import './App.css';

function App() {
  const {
    rows,
    isLoading,
    error,
    setStudentValue,
    resetAll,
    loadData,
    checkWork,
    resetSubsection,
  } = useCalculatorStore();

  // Load default data on app start
  useEffect(() => {
    if (rows.length === 0) {
      // Load the formulas CSV for dynamic calculations
      fetch('/Excel Logic/KaKb Key Calculator Formulas.csv')
        .then(response => response.text())
        .then(content => loadData(content))
        .catch(error => {
          console.error('Error loading default data:', error);
          // Fallback to hardcoded data if file loading fails
          loadData(`,Trial 1,Trial 2,
1b pH of 0.50 M HC2H3O2,2.48,2.5,
Calculations,,,
1ba [H^+],0.003311311,0.003162278,M
1bb [C2H3O2^-],0.003311311,0.003162278,M
1bc [HC2H3O2],0.50,0.50,M
1bd Keq,2.2E-05,2.0E-05,
,,,
,Trial 1,Trial 2,
1c pH of 0.20 M HC2H3O2,2.56,2.55,
Calculations,,,
a [H^+],0.002754229,0.002818383,M
b [C2H3O2^-],0.002754229,0.002818383,M
c [HC2H3O2],0.20,0.20,M
d Keq,3.8E-05,4.0E-05,
,,,
,Trial 1,Trial 2,
1d 0.50 M HC2H3O2 and solid NaC2H3O2,,,
grams of NaC2H3O2,0.5293,0.5234,
pH of mixture,4.22,4.36,
Calculations,,,
a [H^+],6.0256E-05,4.36516E-05,M
b [C2H3O2^-],0.322625869,0.319029623,M
c [HC2H3O2],0.50,0.50,M
d Keq,3.9E-05,2.8E-05,
,,,
Average the six values for Keq,3.1E-05,,
,,,
Calculate your percent error if the known Keq  = 1.76x10^-5,-76.43%,,
,,,
,,,
,,,
2 Keq of an unknown weak acid,Unknown #:,1,
,,,
,Trial 1,Trial 2,
2a pH of 0.10M Unknown Acid,3.03,3.03,
Calculations,,,
a [H^+],0.000933254,0.000933254,M
b [A^-],0.000933254,0.000933254,M
c [HA],0.10,0.10,M
d Keq,8.7E-06,8.7E-06,
,,,
2b 5 mL of 0.1M NaOH plus 25 mL of Unknown Acid,,,
,Trial 1,Trial 2,
a pH of mixture,4.04,4.1,
Calculations,,,
b [H^+],9.12011E-05,7.94328E-05,
c [A^-],0.017,0.017,
d [HA],0.067,0.067,
e Keq,2.3E-05,2.0E-05,
,,,
2c 15 mL of 0.1M NaOH plus 30 mL of Unknown Acid,,,
,Trial 1,Trial 2,
a pH of mixture,4.54,4.64,
Calculations,,,
b [H^+],2.88403E-05,2.29087E-05,
c [A^-],0.033,0.033,
d [HA],0.033,0.033,
e Keq,2.9E-05,2.3E-05,
,,,
Average the six values for Keq,1.86E-05,,
,,,
,,,
3 The Equilibrium Constant of a Weak Base,,,
,Trial 1,Trial 2,
a pH of 0.50M Unknown Weak Base,11.26,11.12,
Calculations,,,
a [OH^],1.82E-03,1.32E-03,M
b [HB^+],1.82E-03,1.32E-03,M
c [B],0.50,0.50,M
d Keq,6.6E-06,3.5E-06,
,,,
2b 5 mL of 0.1M HCl plus 20 mL of 0.50 M Unknown Base,,,
,Trial 1,Trial 2,
a pH of mixture,10.40,10.40,
Calculations,,,
a [OH^],2.51E-04,2.51E-04,M
b [HB^+],2.00E-02,2.00E-02,M
c [B],0.38,0.38,M
d Keq,1.3E-05,1.3E-05,
,,,
Average the four values for Keq,9.13E-06,,`);
        });
    }
  }, [rows.length, loadData]);

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
          <p>Loading lab data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ka/Kb Lab Calculator</h1>
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
            onCheckWork={checkWork}
            onResetSubsection={resetSubsection}
          />
        </div>
        
        <div className="sidebar">
          <SummaryPanel
            rows={rows}
            onReset={resetAll}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
