import React, { useState } from 'react';
import { CalculationRow } from '../types';
import { PDFGenerator } from '../utils/pdfGenerator';

interface PDFButtonProps {
  rows: CalculationRow[];
  title: string;
  studentName?: string;
}

export const PDFButton: React.FC<PDFButtonProps> = ({ rows, title, studentName }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateReport(rows, title, studentName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      className="pdf-button" 
      onClick={handleGeneratePDF}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <span className="button-spinner"></span>
          Generating PDF...
        </>
      ) : (
        <>
          📄 Print as PDF
        </>
      )}
    </button>
  );
};
