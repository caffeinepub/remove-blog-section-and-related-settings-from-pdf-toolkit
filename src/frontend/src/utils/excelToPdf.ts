import { getCurrentLanguage } from '../i18n/storage';
import { translations } from '../i18n/translations';

export async function convertExcelToPdf(
  fileBuffer: ArrayBuffer,
  fileName: string,
  selectedSheets?: string[],
  orientation: 'portrait' | 'landscape' = 'landscape'
): Promise<Blob> {
  // Get current language for error messages
  const lang = getCurrentLanguage() as 'en' | 'es';
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  if (typeof window.XLSX === 'undefined') {
    throw new Error(t('excelToPdf.error.libraryNotLoaded'));
  }

  if (typeof window.jspdf?.jsPDF === 'undefined') {
    throw new Error(t('excelToPdf.error.libraryNotLoaded'));
  }

  try {
    // Parse the Excel file
    const workbook = window.XLSX.read(fileBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error(t('excelToPdf.error.emptyFile'));
    }

    // Determine which sheets to convert
    const sheetsToConvert = selectedSheets && selectedSheets.length > 0
      ? selectedSheets.filter(name => workbook.SheetNames.includes(name))
      : workbook.SheetNames;

    if (sheetsToConvert.length === 0) {
      throw new Error(t('excelToPdf.error.noSheets'));
    }

    // Create PDF with specified orientation
    const pdf = new window.jspdf.jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    let isFirstSheet = true;

    for (const sheetName of sheetsToConvert) {
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) continue;

      // Convert worksheet to array of arrays
      const data = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Filter out completely empty rows
      const filteredData = data.filter(row =>
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      );

      if (filteredData.length === 0) {
        // Skip empty worksheets
        continue;
      }

      // Add new page for each sheet (except the first one)
      if (!isFirstSheet) {
        pdf.addPage();
      }
      isFirstSheet = false;

      // Add sheet name as title
      pdf.setFontSize(16);
      pdf.text(sheetName, 14, 15);

      // Add table using autoTable
      (pdf as any).autoTable({
        head: filteredData.length > 0 ? [filteredData[0]] : [],
        body: filteredData.slice(1),
        startY: 25,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        margin: { top: 25, right: 14, bottom: 14, left: 14 },
        theme: 'grid',
      });
    }

    // Check if any sheets were actually converted
    if (isFirstSheet) {
      throw new Error(t('excelToPdf.error.emptyWorksheet'));
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error: any) {
    console.error('Excel to PDF conversion error:', error);
    throw error;
  }
}
