# Ka/Kb Lab Calculator

A web application for students to check their work in the "Determination of Ka and Kb Lab". Students can enter their calculated values and the app will validate them against expected calculations without revealing the answers.

## Features

- **Real-time Validation**: Enter values and get immediate feedback on accuracy
- **Tolerance Control**: Adjustable tolerance percentage for validation (default 10%)
- **Visual Feedback**: Green checkmarks for correct values, red X's for incorrect ones
- **Progress Tracking**: Summary panel shows completion and accuracy statistics
- **Responsive Design**: Works on desktop and mobile devices
- **CSV Support**: Load custom calculation data from CSV files

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Use

1. **Load Data**: The app will automatically load the default lab data, or you can load a custom CSV file
2. **Enter Values**: Input your calculated values in the appropriate fields
3. **Check Results**: The app will validate your values in real-time:
   - ✅ Green background: Value is within tolerance
   - ❌ Red background: Value is outside tolerance
   - No indicator: No value entered yet
4. **Adjust Tolerance**: Use the slider in the summary panel to change the acceptable error margin
5. **Reset**: Click "Reset All" to clear all entered values

## Data Format

The app expects CSV data with the following structure:
- Column A: Calculation labels
- Column B: Trial 1 values or formulas
- Column C: Trial 2 values or formulas  
- Column D: Units

Formulas should use Excel-style syntax (e.g., `=10^-B4` for 10^(-pH))

## Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Formula Engine**: Math.js
- **Styling**: CSS with responsive design

## Development

### Project Structure

```
src/
├── components/          # React components
├── store/              # Zustand store
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

### Key Components

- **CalculatorGrid**: Displays all calculation rows organized by section
- **CalculatorRow**: Individual row with input field and validation status
- **SummaryPanel**: Progress tracking and tolerance controls
- **FileLoader**: CSV file loading interface

## License

This project is created for educational purposes.
