import jsPDF from 'jspdf';
import { CalculationRow } from '../types';

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;
  private pageWidth: number = 210;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Generate a PDF report with student data and results
   */
  generateReport(rows: CalculationRow[], title: string, studentName?: string): void {
    this.doc = new jsPDF();
    this.currentY = 20;

    // Add title
    this.addTitle(title);
    
    // Add student info if provided
    if (studentName) {
      this.addStudentInfo(studentName);
    }

    // Add summary statistics
    this.addSummaryStats(rows);

    // Add detailed results table
    this.addResultsTable(rows);

    // Add footer
    this.addFooter();

    // Save the PDF
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
    this.doc.save(fileName);
  }

  private addTitle(title: string): void {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;
  }

  private addStudentInfo(studentName: string): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Student: ${studentName}`, this.margin, this.currentY);
    this.doc.text(`Date: ${new Date().toLocaleDateString()}`, this.margin + 100, this.currentY);
    this.currentY += 10;
  }

  private addSummaryStats(rows: CalculationRow[]): void {
    const totalRows = rows.length;
    const completedRows = rows.filter(row => 
      row.studentValueTrial1 !== null || row.studentValueTrial2 !== null
    ).length;
    const correctRows = rows.filter(row => 
      row.isCorrectTrial1 === true || row.isCorrectTrial2 === true
    ).length;
    const closeRows = rows.filter(row => 
      row.isCloseTrial1 === true || row.isCloseTrial2 === true
    ).length;
    const incorrectRows = rows.filter(row => 
      (row.isCorrectTrial1 === false && row.isCloseTrial1 !== true) || 
      (row.isCorrectTrial2 === false && row.isCloseTrial2 !== true)
    ).length;

    const completionPercentage = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
    const accuracyPercentage = completedRows > 0 ? Math.round((correctRows / completedRows) * 100) : 0;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary Statistics', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Create summary table
    const summaryData = [
      ['Completion:', `${completionPercentage}% (${completedRows}/${totalRows})`],
      ['Accuracy:', `${accuracyPercentage}% (${correctRows}/${completedRows})`],
      ['Correct Answers:', correctRows.toString()],
      ['Close Answers:', closeRows.toString()],
      ['Incorrect Answers:', incorrectRows.toString()]
    ];

    this.doc.setFontSize(9);
    summaryData.forEach(([label, value]) => {
      this.doc.text(label, this.margin, this.currentY);
      this.doc.text(value, this.margin + 60, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addResultsTable(rows: CalculationRow[]): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Results', this.margin, this.currentY);
    this.currentY += 10;

    // Add table header
    this.addTableHeader(rows);

    // Group rows by section and subsection
    const groupedRows = this.groupRowsBySection(rows);

    Object.entries(groupedRows).forEach(([sectionTitle, subsections]) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = 20;
      }

      // Add section title
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(sectionTitle, this.margin, this.currentY);
      this.currentY += 8;

      Object.entries(subsections).forEach(([subsectionTitle, subsectionRows]) => {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = 20;
        }

        // Add subsection title
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(subsectionTitle, this.margin + 10, this.currentY);
        this.currentY += 6;

        // Add rows for this subsection
        subsectionRows.forEach(row => {
          this.addRowToPDF(row);
        });

        this.currentY += 5;
      });
    });
  }

  private addRowToPDF(row: CalculationRow): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    // Check if this is a single-trial layout
    const isSingleTrial = !row.trial2DataTag || row.trial2DataTag === '';
    
    // Calculate column positions based on layout
    const labelX = this.margin + 10;
    const maxLabelWidth = isSingleTrial ? 80 : 55; // More space for single trial
    const labelLines = this.wrapText(row.label, maxLabelWidth);
    
    // Draw label (potentially multi-line)
    labelLines.forEach((line, index) => {
      this.doc.text(line, labelX, this.currentY + (index * 4));
    });

    if (isSingleTrial) {
      // Single trial layout - more compact
      const valueX = this.margin + 100;
      const unitX = this.margin + 150;
      
      // Single value
      if (row.trial1DataTag) {
        const value = row.studentValueTrial1 !== null ? row.studentValueTrial1.toString() : 'Not entered';
        const status = this.getStatusText(row.isCorrectTrial1, row.isCloseTrial1);
        
        this.doc.text(`${status}${value}`, valueX, this.currentY);
      }
      
      // Unit
      if (row.unit) {
        this.doc.text(`(${row.unit})`, unitX, this.currentY);
      }
    } else {
      // Two-trial layout
      const trial1X = this.margin + 80;
      const trial2X = this.margin + 120;
      const unitX = this.margin + 160;
      
      // Trial 1 data
      if (row.trial1DataTag) {
        const trial1Value = row.studentValueTrial1 !== null ? row.studentValueTrial1.toString() : 'Not entered';
        const trial1Status = this.getStatusText(row.isCorrectTrial1, row.isCloseTrial1);
        
        this.doc.text(`${trial1Status}${trial1Value}`, trial1X, this.currentY);
      }

      // Trial 2 data
      if (row.trial2DataTag) {
        const trial2Value = row.studentValueTrial2 !== null ? row.studentValueTrial2.toString() : 'Not entered';
        const trial2Status = this.getStatusText(row.isCorrectTrial2, row.isCloseTrial2);
        
        this.doc.text(`${trial2Status}${trial2Value}`, trial2X, this.currentY);
      }

      // Unit
      if (row.unit) {
        this.doc.text(`(${row.unit})`, unitX, this.currentY);
      }
    }

    // Adjust Y position based on label height
    const labelHeight = Math.max(1, labelLines.length) * 4;
    this.currentY += Math.max(labelHeight, 6);
  }

  private getStatusText(isCorrect: boolean | null, isClose: boolean | null): string {
    if (isCorrect === true) return 'O: ';
    if (isClose === true) return '~: ';
    if (isCorrect === false) return 'X: ';
    return '';
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      // Use actual text width measurement instead of character count
      const testWidth = this.doc.getTextWidth(testLine);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than maxWidth, force it on its own line
          lines.push(word);
        }
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private addTableHeader(rows: CalculationRow[]): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }

    // Check if this is a single-trial layout
    const isSingleTrial = rows.some(row => !row.trial2DataTag || row.trial2DataTag === '');

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    
    const labelX = this.margin + 10;

    // Draw header row based on layout
    this.doc.text('Calculation', labelX, this.currentY);
    
    if (isSingleTrial) {
      // Single trial header
      const valueX = this.margin + 100;
      const unitX = this.margin + 150;
      
      this.doc.text('Value & Status', valueX, this.currentY);
      this.doc.text('Unit', unitX, this.currentY);
    } else {
      // Two-trial header
      const trial1X = this.margin + 80;
      const trial2X = this.margin + 120;
      const unitX = this.margin + 160;
      
      this.doc.text('Trial 1 & Status', trial1X, this.currentY);
      this.doc.text('Trial 2 & Status', trial2X, this.currentY);
      this.doc.text('Unit', unitX, this.currentY);
    }

    // Draw line under header
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2);
    
    this.currentY += 8;
  }

  private groupRowsBySection(rows: CalculationRow[]): { [key: string]: { [key: string]: CalculationRow[] } } {
    return rows.reduce((acc, row) => {
      const sectionTitle = row.section;
      const subsectionTitle = row.subsection;

      if (!acc[sectionTitle]) {
        acc[sectionTitle] = {};
      }
      
      if (!acc[sectionTitle][subsectionTitle]) {
        acc[sectionTitle][subsectionTitle] = [];
      }
      acc[sectionTitle][subsectionTitle].push(row);
      return acc;
    }, {} as { [key: string]: { [key: string]: CalculationRow[] } });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - 30, this.pageHeight - 10);
      this.doc.text('Generated by Lab Check Calculator', this.margin, this.pageHeight - 10);
    }
  }
}
