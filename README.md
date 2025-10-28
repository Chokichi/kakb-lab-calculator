# Lab Calculator Platform

A unified web application for chemistry lab calculations with flexible CSV-based configuration.

## Features

- **Unified Platform**: Single webapp with multiple lab calculators
- **Header-Based CSV Format**: Flexible, Excel-friendly CSV structure
- **URL Routing**: Direct links to specific calculators
- **Dynamic Layout**: Auto-detects single vs dual-trial formats
- **Real-time Validation**: Immediate feedback on student calculations
- **PDF Export**: Generate lab reports with student data and results

## Available Calculators

1. **🧪 Titration of a Diprotic Acid** - Single-trial titration calculations
2. **⚗️ Determination of Ka and Kb** - Dual-trial acid-base equilibrium calculations
3. **Colligative Properties**

## URL Examples

- Default: `http://localhost:5180/` → Titration Calculator
- Ka/Kb: `http://localhost:5180/?calculator=kakb` → Ka/Kb Calculator

## CSV Format

The platform uses a header-based CSV format that's Excel-friendly and flexible:

### Single-Trial Format (7 columns):
```csv
Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15
Section,Subsection,DataRef,Label,Trial 1,Unit,Entry Type
```

### Dual-Trial Format (9 columns):
```csv
Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
```

### Column Headers:
- `Title` - Lab title (first row only)
- `Tolerance 1/2` - Good/close tolerance values (first row only)
- `Section` - Main section name
- `Subsection` - Subsection name
- `DataRef*` - Excel cell references (F5, G5, etc.)
- `Label` - Display label for students
- `Trial *` - Trial values or formulas
- `Unit` - Measurement unit
- `Entry Type` - Data, Calculated, Choice, or Text

## Development

```bash
npm install
npm run dev
```

## Deployment

The platform is designed to be deployed as a single application with multiple calculators accessible via URL parameters.

## Adding New Calculators

1. Create a header-based CSV file in the `public/` directory
2. Add the calculator configuration to `src/config/calculators.ts`
3. The platform will automatically detect the format and layout

## Technical Stack

- **React + TypeScript** - Frontend framework
- **Vite** - Build tool
- **Zustand** - State management
- **Math.js** - Formula evaluation
- **jsPDF** - PDF generation
- **Header-Based Parser** - Flexible CSV parsing