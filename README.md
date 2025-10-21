# Ka/Kb Lab Calculator

An interactive web application designed to help students check their work for the "Determination of Ka and Kb Lab". Students can enter their measured pH values and calculated concentrations, and the app provides real-time validation feedback without revealing the correct answers.

## 🎯 Features

### Interactive Lab Calculator
- **Dual Trial Support**: Separate input fields for Trial 1 and Trial 2
- **Section-based Organization**: Each lab section has its own "Check Work" button
- **Real-time Validation**: 2-3 second calculation delay with spinning animation
- **Smart Feedback System**:
  - ✅ **Correct** (within 10% tolerance)
  - ⚠️ **Close** (10-15% error) - Yellow warning
  - ❌ **Incorrect** (>15% error)

### User Experience
- **Check Work Buttons**: Students must actively request validation for each section
- **Empty Box Handling**: Only validates non-empty input fields
- **Scientific Notation Support**: Accepts values like 1.0E-3 for 0.001
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Data Management
- **CSV-based Configuration**: Easy to update lab data via CSV files
- **Multiple Lab Sections**:
  - The equilibrium constant of acetic acid
  - Keq of an unknown weak acid
  - The equilibrium constant of a weak base

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Styling**: CSS with modern gradients and animations
- **Data Processing**: Custom CSV parser
- **Validation**: Tolerance-based comparison logic

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jkawagoe/kakb-lab-calculator.git
   cd kakb-lab-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
kakb-lab-calculator/
├── src/
│   ├── components/          # React components
│   │   ├── CalculatorGrid.tsx    # Main grid layout
│   │   ├── CalculatorRow.tsx     # Individual row component
│   │   ├── CheckWorkButton.tsx   # Check work button with spinner
│   │   ├── FileLoader.tsx        # CSV file upload (unused)
│   │   └── SummaryPanel.tsx      # Progress summary
│   ├── store/
│   │   └── calculatorStore.ts    # Zustand state management
│   ├── utils/
│   │   ├── csvParser.ts          # CSV data parsing
│   │   └── formulaEngine.ts      # Formula evaluation (legacy)
│   ├── types.ts                  # TypeScript definitions
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── public/
│   └── KaKb Key Calculator Labels.csv  # Lab data
├── Excel Logic/               # Original Excel formulas and data
└── README.md
```

## 🎮 How to Use

### For Students
1. **Enter Values**: Input your measured pH values and calculated concentrations
2. **Check Work**: Click the "Check Work" button for each section
3. **Wait for Results**: The app will show "Calculating..." for 2-3 seconds
4. **Review Feedback**: See ✅, ⚠️, or ❌ indicators for each value
5. **Reset if Needed**: Click "Reset" to clear results and try again

### For Instructors
1. **Update Data**: Modify the CSV file in `public/KaKb Key Calculator Labels.csv`
2. **Adjust Tolerance**: Change the tolerance value in `src/store/calculatorStore.ts`
3. **Customize Sections**: Update the CSV structure to add/remove lab sections

## 📊 CSV Data Format

The app uses a structured CSV format with the following columns:
- **Section**: Main lab section title
- **Subsection**: Specific experiment within the section
- **Label**: Description of the measurement/calculation
- **Trial 1**: Expected value for Trial 1
- **Trial 2**: Expected value for Trial 2
- **Unit**: Unit of measurement

## 🔧 Configuration

### Tolerance Settings
The validation tolerance is set to 10% by default. To change this:
1. Open `src/store/calculatorStore.ts`
2. Modify the `tolerance` value in the store
3. The "close" range is automatically set to 10-15% of the tolerance

### Adding New Lab Sections
1. Update the CSV file with new section data
2. Ensure proper section/subsection structure
3. The app will automatically detect and display new sections

## 🎨 Customization

### Styling
- Main styles: `src/App.css`
- Component-specific styles are co-located with components
- Uses CSS custom properties for easy theme changes

### Input Types
The app automatically detects input types based on labels:
- **pH**: pH measurements
- **Mass**: Mass measurements (grams)
- **Keq**: Equilibrium constants
- **Concentration**: Molar concentrations
- **Unknown #**: Unknown sample numbers

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: The app will automatically try the next available port
2. **CSV not loading**: Check that the CSV file is in the `public/` directory
3. **Values not validating**: Ensure the CSV has the correct structure

### Development
- **Hot Reload**: Changes are automatically reflected in the browser
- **TypeScript**: Full type safety with comprehensive interfaces
- **Linting**: ESLint and TypeScript compiler check for errors

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.

---

**Built with ❤️ for chemistry education**