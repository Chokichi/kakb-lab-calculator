# CSV Format Standard for Lab Calculators

## Standardized Column Structure

### For Single-Trial Labs (like Titration):
```csv
Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15,,,
Section,Subsection,DataRef,Label,Value,Unit,Entry Type
```

### For Dual-Trial Labs (like Ka/Kb):
```csv
Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15,,,
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
```

## Column Definitions

| Column | Purpose | Example | Notes |
|--------|---------|---------|-------|
| `Title` | Lab title | "Titration of a Diprotic Acid" | First row only |
| `Tolerance 1` | Good tolerance | 0.1 (10%) | First row only |
| `Tolerance 2` | Close tolerance | 0.15 (15%) | First row only |
| `Section` | Main section | "Data Table" | Can be empty for subsections |
| `Subsection` | Subsection | "pH of 0.50 M HC2H3O2" | Can be empty for sections |
| `DataRef` | Excel cell reference | "F5" | Single trial |
| `DataRef1` | Trial 1 reference | "F5" | Dual trial |
| `DataRef2` | Trial 2 reference | "G5" | Dual trial |
| `Label` | Display label | "pH of solution" | Required |
| `Value` | Expected value | "2.56" | Single trial |
| `Trial 1` | Trial 1 value | "2.56" | Dual trial |
| `Trial 2` | Trial 2 value | "2.55" | Dual trial |
| `Unit` | Measurement unit | "pH", "M", "g" | Required |
| `Entry Type` | Input type | "Data", "Calculated", "Choice", "Text" | Required |

## Entry Types

| Type | Description | Student Input | Validation |
|------|-------------|---------------|------------|
| `Data` | Direct measurement | ✅ Required | Compare to expected |
| `Calculated` | Formula result | ✅ Optional | Compare to calculated |
| `Choice` | Dropdown selection | ✅ Required | Compare to expected |
| `Text` | Text input | ✅ Required | No validation |

## Section/Subsection Rules

1. **Section Headers**: Use full section name, leave other columns empty
2. **Subsection Headers**: Leave Section empty, use subsection name
3. **Data Rows**: Fill all required columns
4. **Empty Rows**: Use for spacing, will be ignored

## Formula Format

- **Excel Formulas**: Start with `=`
- **Direct Values**: No prefix
- **Choice Options**: Use semicolon separator: "First; Second"
- **NA Values**: Use "NA" for missing data

## Examples

### Single-Trial Format:
```csv
Title,Titration of a Diprotic Acid,Tolerance 1,0.1,Tolerance 2,0.15,,,
Section,Subsection,DataRef,Label,Value,Unit,Entry Type
Data Table,,,,,,
,,F3,Mass of diprotic acid,0.12,g,Data
,,F4,Concentration of NaOH,0.1,M,Data
```

### Dual-Trial Format:
```csv
Title,Determination of Ka and Kb,Tolerance 1,0.1,Tolerance 2,0.15,,,
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
The equilibrium constant of acetic acid,,,,,,,,
,pH of 0.50 M HC2H3O2,,,,,,,
,,F5,G5,pH of 0.50 M HC2H3O2,2.56,2.56,pH,Data
,,F6,G6,[H^+],=10^-F5,=10^-G5,M,Calculated
```
