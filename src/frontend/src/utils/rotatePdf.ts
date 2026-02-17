/**
 * Client-side PDF rotation utility using pdf-lib
 */

export type RotationAngle = 90 | 180 | 270;

export async function rotatePdf(
  file: File,
  angle: RotationAngle,
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  // Validate inputs
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('File must be a PDF');
  }

  if (![90, 180, 270].includes(angle)) {
    throw new Error('Rotation angle must be 90, 180, or 270 degrees');
  }

  // Check if PDFLib is available
  if (typeof window === 'undefined' || !window.PDFLib) {
    throw new Error('PDF library not loaded. Please refresh the page and try again.');
  }

  try {
    onProgress?.(10);

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(30);

    // Load the PDF document
    const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
    onProgress?.(50);

    // Get all pages
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // Rotate each page
    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angle) % 360;
      page.setRotation({ angle: newRotation });

      // Update progress
      const pageProgress = 50 + Math.floor((i + 1) / totalPages * 40);
      onProgress?.(pageProgress);
    }

    onProgress?.(90);

    // Save the rotated PDF
    const pdfBytes = await pdfDoc.save();
    onProgress?.(95);

    // Create a blob from the bytes - cast to unknown first then to ArrayBuffer
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    onProgress?.(100);

    return blob;
  } catch (error: any) {
    console.error('PDF rotation error:', error);
    throw new Error(error.message || 'Failed to rotate PDF');
  }
}
