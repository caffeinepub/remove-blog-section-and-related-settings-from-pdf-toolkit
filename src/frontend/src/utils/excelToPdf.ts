export async function convertExcelToPdf(
  fileBuffer: ArrayBuffer,
  fileName: string,
  selectedSheets: string[],
  orientation: 'portrait' | 'landscape' = 'landscape'
): Promise<Blob> {
  if (typeof window.XLSX === 'undefined') {
    throw new Error('XLSX library not loaded. Please refresh the page.');
  }

  if (typeof window.jsPDF === 'undefined') {
    throw new Error('jsPDF library not loaded. Please refresh the page.');
  }

  const workbook = window.XLSX.read(fileBuffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No worksheets found in the Excel file');
  }

  if (selectedSheets.length === 0) {
    throw new Error('Please select at least one worksheet');
  }

  // Validate selected sheets exist
  for (const sheetName of selectedSheets) {
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Worksheet "${sheetName}" not found`);
    }
  }

  const pdf = new window.jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  let isFirstSheet = true;

  for (const sheetName of selectedSheets) {
    if (!isFirstSheet) {
      pdf.addPage();
    }
    isFirstSheet = false;

    const worksheet = workbook.Sheets[sheetName];
    const htmlString = window.XLSX.utils.sheet_to_html(worksheet);

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const table = tempDiv.querySelector('table');

    if (!table) {
      continue;
    }

    // Add sheet name as title
    pdf.setFontSize(14);
    pdf.text(sheetName, 10, 10);

    // Convert table to PDF using autoTable if available, otherwise simple text
    const rows: string[][] = [];
    const tableRows = table.querySelectorAll('tr');

    tableRows.forEach((tr) => {
      const row: string[] = [];
      const cells = tr.querySelectorAll('td, th');
      cells.forEach((cell) => {
        row.push(cell.textContent || '');
      });
      if (row.length > 0) {
        rows.push(row);
      }
    });

    // Simple text rendering
    let yPos = 20;
    const lineHeight = 5;
    const maxWidth = orientation === 'portrait' ? 190 : 277;

    rows.forEach((row, rowIndex) => {
      if (yPos > (orientation === 'portrait' ? 280 : 190)) {
        pdf.addPage();
        yPos = 10;
      }

      pdf.setFontSize(8);
      const rowText = row.join(' | ');
      const lines = pdf.splitTextToSize(rowText, maxWidth);

      lines.forEach((line: string) => {
        pdf.text(line, 10, yPos);
        yPos += lineHeight;
      });
    });
  }

  return pdf.output('blob');
}
