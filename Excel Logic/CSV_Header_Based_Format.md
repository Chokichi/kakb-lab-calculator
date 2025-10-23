# Header-Based CSV Format for Lab Calculators

## Flexible Column Structure

### Excel-Friendly Format
```csv
Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
```

### Key Benefits:
- ✅ **Excel Compatible**: Easy to create and edit in Excel
- ✅ **Flexible**: Can add Trial 3, Trial 4, etc. by adding columns
- ✅ **Header-Driven**: Parser uses column headers to understand structure
- ✅ **Backward Compatible**: Works with existing single-trial CSVs

## Column Header Mapping

| Header Pattern | Purpose | Example | Parser Logic |
|----------------|---------|---------|--------------|
| `Title` | Lab title | "Titration of a Diprotic Acid" | First row only |
| `Tolerance 1` | Good tolerance | 0.1 | First row only |
| `Tolerance 2` | Close tolerance | 0.15 | First row only |
| `Section` | Main section | "Data Table" | Can be empty |
| `Subsection` | Subsection | "pH of 0.50 M HC2H3O2" | Can be empty |
| `DataRef*` | Excel cell reference | "F5", "G5", "H5" | Maps to Trial columns |
| `Label` | Display label | "pH of solution" | Required |
| `Trial *` | Trial values | "2.56", "2.55" | Maps to DataRef columns |
| `Unit` | Measurement unit | "pH", "M", "g" | Required |
| `Entry Type` | Input type | "Data", "Calculated", "Choice" | Required |

## Dynamic Column Detection

### Parser Logic:
1. **Scan headers** to identify column types
2. **Map DataRef columns** to Trial columns by position
3. **Detect trial count** from Trial column count
4. **Handle missing columns** gracefully

### Example Mappings:

#### Single Trial (7 columns):
```csv
Section,Subsection,DataRef,Label,Trial 1,Unit,Entry Type
```
- `DataRef` → `Trial 1`

#### Dual Trial (9 columns):
```csv
Section,Subsection,DataRef1,DataRef2,Label,Trial 1,Trial 2,Unit,Entry Type
```
- `DataRef1` → `Trial 1`
- `DataRef2` → `Trial 2`

#### Triple Trial (11 columns):
```csv
Section,Subsection,DataRef1,DataRef2,DataRef3,Label,Trial 1,Trial 2,Trial 3,Unit,Entry Type
```
- `DataRef1` → `Trial 1`
- `DataRef2` → `Trial 2`
- `DataRef3` → `Trial 3`

## Excel Template Creation

### Step 1: Create Header Row
1. Start with standard headers: `Section,Subsection,Label,Unit,Entry Type`
2. Add `DataRef1,DataRef2` for dual trials
3. Add `Trial 1,Trial 2` corresponding to DataRef columns
4. Insert `Label` between DataRef and Trial columns

### Step 2: Add Data Rows
1. Fill section/subsection as needed
2. Add DataRef values (F5, G5, etc.)
3. Add Label for each row
4. Add Trial values or formulas
5. Add Unit and Entry Type

### Step 3: Add Title Row
1. First row: `Title,Lab Name,Tolerance 1,0.1,Tolerance 2,0.15`
2. Leave other columns empty in title row

## Parser Implementation

```typescript
interface ColumnMapping {
  title: number;
  tolerance1: number;
  tolerance2: number;
  section: number;
  subsection: number;
  label: number;
  unit: number;
  entryType: number;
  dataRefs: number[];
  trials: number[];
}

function detectColumnStructure(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    title: -1,
    tolerance1: -1,
    tolerance2: -1,
    section: -1,
    subsection: -1,
    label: -1,
    unit: -1,
    entryType: -1,
    dataRefs: [],
    trials: []
  };

  headers.forEach((header, index) => {
    const lower = header.toLowerCase();
    if (lower === 'title') mapping.title = index;
    else if (lower === 'tolerance 1') mapping.tolerance1 = index;
    else if (lower === 'tolerance 2') mapping.tolerance2 = index;
    else if (lower === 'section') mapping.section = index;
    else if (lower === 'subsection') mapping.subsection = index;
    else if (lower === 'label') mapping.label = index;
    else if (lower === 'unit') mapping.unit = index;
    else if (lower === 'entry type') mapping.entryType = index;
    else if (lower.startsWith('dataref')) mapping.dataRefs.push(index);
    else if (lower.startsWith('trial')) mapping.trials.push(index);
  });

  return mapping;
}
```

## Benefits of Header-Based Approach

1. **Excel Friendly**: Easy to create templates in Excel
2. **Flexible**: Can handle any number of trials
3. **Self-Documenting**: Headers explain the structure
4. **Robust**: Handles missing or extra columns gracefully
5. **Future-Proof**: Easy to add new column types

## Migration Strategy

1. **Update existing CSVs** to use standardized headers
2. **Implement header-based parser** to replace current logic
3. **Test with both single and dual-trial formats**
4. **Gradually migrate all CSV files** to new format
