/**
 * Splits a PDF file using pdf-lib from CDN
 * Supports extracting a page range or splitting into individual pages
 */

export interface SplitOptions {
  mode: 'range' | 'per-page';
  startPage?: number; // 1-indexed
  endPage?: number; // 1-indexed
}

export interface SplitResult {
  blob: Blob;
  filename: string;
}

/**
 * Splits a PDF file based on the provided options
 * @param file PDF File object to split
 * @param options Split configuration (mode and page range)
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise resolving to array of split PDF results
 */
export async function splitPdf(
  file: File,
  options: SplitOptions,
  onProgress?: (percentage: number) => void
): Promise<SplitResult[]> {
  if (!file) {
    throw new Error('No file provided for splitting');
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
      onProgress(20);
    }

    // Load the PDF
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    if (onProgress) {
      onProgress(30);
    }

    // Validate page range for range mode
    if (options.mode === 'range') {
      const startPage = options.startPage || 1;
      const endPage = options.endPage || totalPages;

      if (startPage < 1 || startPage > totalPages) {
        throw new Error(`Invalid start page: ${startPage}. Must be between 1 and ${totalPages}.`);
      }

      if (endPage < 1 || endPage > totalPages) {
        throw new Error(`Invalid end page: ${endPage}. Must be between 1 and ${totalPages}.`);
      }

      if (startPage > endPage) {
        throw new Error(`Start page (${startPage}) cannot be greater than end page (${endPage}).`);
      }

      // Extract page range
      const newPdf = await PDFDocument.create();
      const pageIndices = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage - 1 + i
      );
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      if (onProgress) {
        onProgress(80);
      }

      const pdfBytes = await newPdf.save();
      
      if (onProgress) {
        onProgress(100);
      }

      // Cast to unknown first then to ArrayBuffer
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
      const baseFilename = file.name.replace('.pdf', '');
      const filename = `${baseFilename}_pages_${startPage}-${endPage}.pdf`;

      return [{ blob, filename }];
    } else {
      // Split into individual pages
      const results: SplitResult[] = [];
      const baseFilename = file.name.replace('.pdf', '');

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        // Cast to unknown first then to ArrayBuffer
        const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
        const filename = `${baseFilename}_page_${i + 1}.pdf`;

        results.push({ blob, filename });

        // Update progress
        if (onProgress) {
          const progress = 30 + Math.floor(((i + 1) / totalPages) * 70);
          onProgress(progress);
        }
      }

      return results;
    }
  } catch (error) {
    console.error('PDF split error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
    throw new Error('Failed to split PDF: Unknown error');
  }
}
