/**
 * Compresses a PDF file by re-saving it with optimization using pdf-lib from CDN
 * @param file PDF File object to compress
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise resolving to compressed PDF Blob
 */
export async function compressPdf(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  if (!file) {
    throw new Error('No file provided for compression');
  }

  // Validate file type
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error(`Invalid file type: ${file.name}. Only PDF files are supported.`);
  }

  // Check if pdf-lib is loaded
  if (typeof window.PDFLib === 'undefined') {
    throw new Error('PDF library not loaded. Please refresh the page and try again.');
  }

  try {
    const { PDFDocument } = window.PDFLib;
    
    // Report initial progress
    if (onProgress) {
      onProgress(10);
    }

    // Read file as array buffer
    const fileBuffer = await file.arrayBuffer();
    
    if (onProgress) {
      onProgress(30);
    }

    // Load the PDF
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    if (onProgress) {
      onProgress(60);
    }

    // Save with compression options
    // pdf-lib automatically applies compression when saving
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
    });
    
    if (onProgress) {
      onProgress(90);
    }

    // Convert to Blob - cast to unknown first then to ArrayBuffer
    const blob = new Blob([compressedPdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    
    if (onProgress) {
      onProgress(100);
    }

    return blob;
  } catch (error) {
    console.error('PDF compression error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
    throw new Error('Failed to compress PDF: Unknown error');
  }
}
