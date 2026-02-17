/**
 * Merges multiple PDF files into a single PDF blob using pdf-lib from CDN
 * @param files Array of PDF File objects to merge
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise resolving to merged PDF Blob
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('No files provided for merging');
  }

  if (files.length === 1) {
    throw new Error('At least two PDF files are required for merging');
  }

  // Check if pdf-lib is loaded
  if (typeof window.PDFLib === 'undefined') {
    throw new Error('PDF library not loaded. Please refresh the page and try again.');
  }

  try {
    const { PDFDocument } = window.PDFLib;
    
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error(`Invalid file type: ${file.name}. Only PDF files are supported.`);
      }

      // Read file as array buffer
      const fileBuffer = await file.arrayBuffer();
      
      // Load the PDF
      const pdf = await PDFDocument.load(fileBuffer);
      
      // Get all page indices
      const pageCount = pdf.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
      
      // Copy all pages from this PDF to the merged PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });

      // Report progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / files.length) * 100);
        onProgress(progress);
      }
    }

    // Save the merged PDF as bytes
    const mergedPdfBytes = await mergedPdf.save();
    
    // Convert to Blob - cast to unknown first then to ArrayBuffer
    const blob = new Blob([mergedPdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error('PDF merge error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
    throw new Error('Failed to merge PDFs: Unknown error');
  }
}
