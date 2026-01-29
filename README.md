# Lab Calculator Platform

A unified web application for chemistry lab calculations with flexible CSV-based configuration. Students enter their experimental data and calculated values, and the platform validates their work against expected results.

## Features

- **Multiple Calculators**: Single webapp with multiple lab calculators accessible via dropdown
- **Section-Based CSV Format**: Clean, documented CSV structure for easy lab creation
- **Auto-Detection**: Automatically generates calculator list from CSV files in `public/`
- **URL Routing**: Direct links to specific calculators (e.g., `?calculator=kakb-determination`)
- **Dynamic Layout**: Auto-detects single vs dual-trial formats
- **Real-time Validation**: Immediate feedback with correct/close/incorrect indicators
- **Tolerance Levels**: Configurable warning (close) and incorrect thresholds
- **PDF Export**: Generate lab reports with student data and validation results
- **Local Storage**: Auto-saves student progress with restoration prompt

## Available Calculators

| Calculator | Trials | Description |
|------------|--------|-------------|
| 🧊 Colligative Properties Lab | 2 | Freezing point depression and molar mass determination |
| ⚗️ Determination of Ka and Kb | 2 | Dual-trial acid-base equilibrium calculations |
| 🌡️ Molar Mass of a Volatile Liquid | 2 | Gas law calculations with 2 trials |
| 💨 Quantitative Preparation of a Gas | 1 | Volume of gas produced calculations |
| 🔬 Specific Heat and Heat Transfer | 1 | Calorimetry calculations |
| 🧪 Titration of a Diprotic Acid | 1 | Single-trial titration with equivalence points |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## CSV Format (Section-Based)

The platform uses a section-based CSV format with clear markers:

```csv
\Start Parameters,,,,,,,,
Title,Experiment Title,,,,,,,
Description,Brief description of the lab,,,,,,,
Icon,🧪,,,,,,,
Warning Tolerance,0.05,,,,,,,
Incorrect Tolerance,0.1,,,,,,,
Trials,2,,,,,,,
\End Parameters,,,,,,,,

\Start Table,,,,,,,,
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
Part 1: Data,,,,,,,,
,Data,,,,,,,
,,=F5,=G5,Mass of sample,10.5,10.3,g,Data
,Calculations,,,,,,,
,,=F8,=G8,Calculated mass,=F5*2,=G5*2,g,Calculated
```

### Parameters Section

| Parameter | Description | Example |
|-----------|-------------|---------|
| `Title` | Calculator name in dropdown | `Molar Mass Lab` |
| `Description` | Brief description | `Calculate molar mass from gas data` |
| `Icon` | Emoji for visual identification | `🧪`, `⚗️`, `🌡️`, `🧊`, `💨` |
| `Warning Tolerance` | Decimal for "close" threshold | `0.05` (5%) |
| `Incorrect Tolerance` | Decimal for "incorrect" threshold | `0.1` (10%) |
| `Trials` | Number of trials (1 or 2) | `1` or `2` |
| `Template` | Set to `true` to exclude from calculator list | `true` |

### Entry Types

| Type | Description | Example Value |
|------|-------------|---------------|
| `Data` | Student enters numeric value | `10.5` |
| `Calculated` | Student calculates and enters result | `=F8-F5` |
| `Choice` | Dropdown selection | `A; B; C; D` |
| `Text` | Free-form text entry | `Sample Name` |

### Table Columns

| Column | Description |
|--------|-------------|
| `Section` | Main section header (e.g., "Part 1: Data Collection") |
| `Subsection` | Sub-grouping (e.g., "Data", "Calculations") |
| `DataRef1/2` | Cell reference for Trial 1/2 (e.g., `=F5`, `=G5`) |
| `Label` | Description shown to student |
| `Trial 1/2` | Value, formula, or `NA` for single-column results |
| `Unit` | Unit of measurement (e.g., `g`, `mL`, `mol`) |
| `Entry Type` | One of: `Data`, `Calculated`, `Choice`, `Text` |

### Formula Syntax

- Start formulas with `=` (e.g., `=F8-F5`)
- Reference cells by their DataRef (e.g., `F5`, `G5`)
- Supported operators: `+`, `-`, `*`, `/`, `^`, parentheses
- Use `10^(-F5)` for exponents with cell references
- For averages: `=(A+B+C)/3` (not `AVERAGE()`)
- Use `NA` in Trial 2 for values calculated from both trials

## Adding New Calculators

1. **Create CSV**: Copy `public/New_Template_Generic.csv` as a starting point
2. **Edit Parameters**: Set title, description, icon, tolerances, and trials
3. **Define Table**: Add your data rows, calculations, and formulas
4. **Remove Template Flag**: Delete the `Template,true` line
5. **Rebuild**: Run `npm run build` to auto-detect the new calculator

The build process automatically:
- Scans `public/` for CSV files with `\Start Parameters`
- Extracts metadata and generates calculator configurations
- Excludes files marked with `Template,true`

## URL Parameters

Access specific calculators directly:
- Default: `http://localhost:5173/`
- Specific: `http://localhost:5173/?calculator=kakb-determination`

Calculator IDs are derived from filenames (lowercase, hyphens for spaces/special chars).

## Project Structure

```
├── public/                    # CSV calculator files
│   ├── New_Template_Generic.csv  # Template with documentation
│   ├── Colligative_Properties.csv
│   ├── KaKb_Determination.csv
│   └── ...
├── scripts/
│   └── generate-calculators.js   # Build-time config generator
├── src/
│   ├── components/            # React components
│   ├── config/
│   │   └── calculators.ts     # Auto-generated calculator list
│   ├── store/
│   │   └── calculatorStore.ts # Zustand state management
│   ├── utils/
│   │   ├── sectionBasedCsvParser.ts  # CSV parser
│   │   ├── formulaEngine.ts   # Math.js formula evaluation
│   │   ├── pdfGenerator.ts    # PDF report generation
│   │   └── localStorage.ts    # Progress persistence
│   └── types.ts               # TypeScript interfaces
└── Excel Logic/               # Source Excel files and CSVs
```

## Technical Stack

- **React + TypeScript** - Frontend framework
- **Vite** - Build tool with hot module replacement
- **Zustand** - Lightweight state management
- **Math.js** - Formula parsing and evaluation
- **jsPDF** - PDF report generation
- **PapaParse** - CSV parsing

## Development Notes

### CSV Export from Excel

When exporting CSVs from Excel, formulas are converted to calculated values. To preserve formulas:
1. Enter formulas as text with a leading single quote: `'=F8-F5`
2. Or manually type formulas in the CSV file

### Validation Logic

- **Correct** (✓): Within warning tolerance of expected value
- **Close** (~): Between warning and incorrect tolerance
- **Incorrect** (✗): Beyond incorrect tolerance
- Dependencies: Calculated fields show missing dependency warnings until all inputs are provided

## License

MIT
