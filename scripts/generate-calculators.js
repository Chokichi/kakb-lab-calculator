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

/**
 * Check if CSV uses section-based format (\Start Parameters)
 */
function isSectionBasedFormat(csvContent) {
  const lowerContent = csvContent.toLowerCase();
  return lowerContent.includes('\\start parameters') && lowerContent.includes('\\start table');
}

/**
 * Extract metadata from section-based CSV format
 */
function extractSectionBasedMetadata(csvContent) {
  const lines = csvContent.split('\n');
  
  // Find parameters section boundaries
  const paramStartIndex = lines.findIndex(line => line.toLowerCase().trim().startsWith('\\start parameters'));
  const paramEndIndex = lines.findIndex(line => line.toLowerCase().trim().startsWith('\\end parameters'));
  
  if (paramStartIndex === -1 || paramEndIndex === -1) {
    return null;
  }
  
  let title = 'Lab Calculator';
  let description = 'Laboratory calculation tool';
  let icon = '🔬';
  let color = '#2196F3';
  let warningTolerance = 0.05;
  let incorrectTolerance = 0.1;
  let trials = 2;
  
  // Parse parameter rows
  for (let i = paramStartIndex + 1; i < paramEndIndex; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line
    const parts = line.split(',').map(p => p.trim());
    const key = parts[0]?.toLowerCase();
    const value = parts[1];
    
    if (!key || !value) continue;
    
    switch (key) {
      case 'title':
        title = value;
        break;
      case 'description':
        description = value;
        break;
      case 'icon':
        icon = value;
        break;
      case 'color':
        color = value;
        break;
      case 'warning tolerance':
        warningTolerance = parseFloat(value) || 0.05;
        break;
      case 'incorrect tolerance':
        incorrectTolerance = parseFloat(value) || 0.1;
        break;
      case 'trials':
        trials = parseInt(value) || 2;
        break;
    }
  }
  
  return {
    title,
    description,
    icon,
    color,
    warningTolerance,
    incorrectTolerance,
    trials,
    format: 'section-based'
  };
}

/**
 * Extract metadata from header-based CSV format (legacy)
 */
function extractHeaderBasedMetadata(csvContent) {
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
  
  return {
    title,
    description,
    icon,
    color,
    format: 'header-based'
  };
}

function extractMetadataFromCSV(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    let metadata;
    
    // Detect format and extract metadata accordingly
    if (isSectionBasedFormat(csvContent)) {
      metadata = extractSectionBasedMetadata(csvContent);
    } else {
      metadata = extractHeaderBasedMetadata(csvContent);
    }
    
    if (!metadata) return null;
    
    // Auto-detect lab type if not specified
    const labType = detectLabType(metadata.title, metadata.description);
    
    // Apply default icon/color if not explicitly set
    if (metadata.icon === '🔬') {
      metadata.icon = LAB_ICONS[labType] || LAB_ICONS.default;
    }
    if (metadata.color === '#2196F3') {
      metadata.color = LAB_COLORS[labType] || LAB_COLORS.default;
    }
    
    return {
      ...metadata,
      labType
    };
  } catch (error) {
    console.error(`Error reading CSV ${csvPath}:`, error);
    return null;
  }
}

/**
 * Check if a CSV file is a valid calculator file
 * Supports both HeaderBased and Section-based formats
 */
function isValidCalculatorCSV(filePath) {
  // First check by filename pattern
  const fileName = path.basename(filePath);
  if (fileName.includes('HeaderBased')) {
    return true;
  }
  
  // Then check file content for section-based format
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return isSectionBasedFormat(content);
  } catch {
    return false;
  }
}

function generateCalculatorConfigs() {
  const publicDir = path.join(__dirname, '../public');
  const calculators = [];
  
  try {
    const files = fs.readdirSync(publicDir);
    const csvFiles = files.filter(file => {
      if (!file.endsWith('.csv')) return false;
      const csvPath = path.join(publicDir, file);
      return isValidCalculatorCSV(csvPath);
    });
    
    console.log(`Found ${csvFiles.length} calculator CSV files:`, csvFiles);
    
    csvFiles.forEach((file, index) => {
      const csvPath = path.join(publicDir, file);
      const metadata = extractMetadataFromCSV(csvPath);
      
      if (metadata) {
        // Generate ID from filename (handle both formats)
        let id = file
          .replace('_HeaderBased.csv', '')
          .replace('.csv', '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-');
        
        const config = {
          id,
          name: metadata.title,
          description: metadata.description,
          csvFile: `/${file}`,
          icon: metadata.icon,
          color: metadata.color,
          labType: metadata.labType,
          format: metadata.format
        };
        
        calculators.push(config);
        console.log(`Generated config for ${file}: ${config.name} (${metadata.format})`);
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
  format?: 'header-based' | 'section-based';
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

export const getCalculatorsByFormat = (format: 'header-based' | 'section-based'): CalculatorConfig[] => {
  return calculators.filter(calc => calc.format === format);
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
