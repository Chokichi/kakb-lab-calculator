import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icons for different lab types
const LAB_ICONS = {
  'titration': '🧪',
  'acid': '⚗️',
  'base': '🧬',
  'equilibrium': '⚖️',
  'kinetics': '⚡',
  'thermodynamics': '🌡️',
  'electrochemistry': '🔋',
  'organic': '🧪',
  'inorganic': '⚗️',
  'analytical': '📊',
  'physical': '🔬',
  'biochemistry': '🧬',
  'default': '🔬'
};

// Colors for different lab types
const LAB_COLORS = {
  'titration': '#4CAF50',
  'acid': '#2196F3',
  'base': '#FF9800',
  'equilibrium': '#9C27B0',
  'kinetics': '#F44336',
  'thermodynamics': '#FF5722',
  'electrochemistry': '#607D8B',
  'organic': '#795548',
  'inorganic': '#3F51B5',
  'analytical': '#009688',
  'physical': '#673AB7',
  'biochemistry': '#4CAF50',
  'default': '#2196F3'
};

function detectLabType(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('titration')) return 'titration';
  if (text.includes('acid') || text.includes('ka') || text.includes('kb')) return 'acid';
  if (text.includes('base')) return 'base';
  if (text.includes('equilibrium')) return 'equilibrium';
  if (text.includes('kinetic')) return 'kinetics';
  if (text.includes('thermodynamic') || text.includes('enthalpy') || text.includes('entropy')) return 'thermodynamics';
  if (text.includes('electrochem') || text.includes('galvanic') || text.includes('electrolytic')) return 'electrochemistry';
  if (text.includes('organic')) return 'organic';
  if (text.includes('inorganic')) return 'inorganic';
  if (text.includes('analytical') || text.includes('spectroscopy')) return 'analytical';
  if (text.includes('physical')) return 'physical';
  if (text.includes('biochem') || text.includes('protein') || text.includes('enzyme')) return 'biochemistry';
  
  return 'default';
}

function extractMetadataFromCSV(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: false, skipEmptyLines: true });
    const data = parsed.data;
    
    if (data.length === 0) return null;
    
    // Extract metadata from first row
    const firstRow = data[0];
    let title = 'Lab Calculator';
    let description = 'Laboratory calculation tool';
    let icon = '🔬';
    let color = '#2196F3';
    
    // Parse metadata from first row (Title, Description, Icon, Color)
    for (let i = 0; i < firstRow.length; i += 2) {
      const key = firstRow[i]?.trim();
      const value = firstRow[i + 1]?.trim();
      
      if (key === 'Title' && value) {
        title = value;
      } else if (key === 'Description' && value) {
        description = value;
      } else if (key === 'Icon' && value) {
        icon = value;
      } else if (key === 'Color' && value) {
        color = value;
      }
    }
    
    // Auto-detect lab type if not specified
    const labType = detectLabType(title, description);
    if (!firstRow.includes('Icon')) {
      icon = LAB_ICONS[labType] || LAB_ICONS.default;
    }
    if (!firstRow.includes('Color')) {
      color = LAB_COLORS[labType] || LAB_COLORS.default;
    }
    
    return {
      title,
      description,
      icon,
      color,
      labType
    };
  } catch (error) {
    console.error(`Error reading CSV ${csvPath}:`, error);
    return null;
  }
}

function generateCalculatorConfigs() {
  const publicDir = path.join(__dirname, '../public');
  const calculators = [];
  
  try {
    const files = fs.readdirSync(publicDir);
    const csvFiles = files.filter(file => 
      file.endsWith('.csv') && 
      file.includes('HeaderBased') // Only process HeaderBased CSV files
    );
    
    console.log(`Found ${csvFiles.length} CSV files:`, csvFiles);
    
    csvFiles.forEach((file, index) => {
      const csvPath = path.join(publicDir, file);
      const metadata = extractMetadataFromCSV(csvPath);
      
      if (metadata) {
        // Generate ID from filename
        const id = file.replace('_HeaderBased.csv', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const config = {
          id,
          name: metadata.title,
          description: metadata.description,
          csvFile: `/${file}`,
          icon: metadata.icon,
          color: metadata.color,
          labType: metadata.labType
        };
        
        calculators.push(config);
        console.log(`Generated config for ${file}:`, config.name);
      }
    });
    
    // Sort calculators by name
    calculators.sort((a, b) => a.name.localeCompare(b.name));
    
    return calculators;
  } catch (error) {
    console.error('Error scanning public directory:', error);
    return [];
  }
}

function generateConfigFile(calculators) {
  const configContent = `// Auto-generated calculator configurations
// Generated on: ${new Date().toISOString()}
// Do not edit this file manually - it will be overwritten

export interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  csvFile: string;
  icon?: string;
  color?: string;
  labType?: string;
}

export const calculators: CalculatorConfig[] = ${JSON.stringify(calculators, null, 2)};

export const getCalculatorById = (id: string): CalculatorConfig | undefined => {
  return calculators.find(calc => calc.id === id);
};

export const getDefaultCalculator = (): CalculatorConfig => {
  return calculators[0] || {
    id: 'default',
    name: 'Lab Calculator',
    description: 'Laboratory calculation tool',
    csvFile: '/default.csv',
    icon: '🔬',
    color: '#2196F3'
  };
};

export const getCalculatorsByLabType = (labType: string): CalculatorConfig[] => {
  return calculators.filter(calc => calc.labType === labType);
};
`;

  const outputPath = path.join(__dirname, '../src/config/calculators.ts');
  fs.writeFileSync(outputPath, configContent);
  console.log(`Generated calculator configs: ${calculators.length} calculators`);
}

// Run the generation
const calculators = generateCalculatorConfigs();
generateConfigFile(calculators);

export { generateCalculatorConfigs, generateConfigFile };
