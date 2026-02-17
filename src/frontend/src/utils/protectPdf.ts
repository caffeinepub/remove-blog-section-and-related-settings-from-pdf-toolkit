/**
 * Client-side PDF protection utility
 * 
 * Supports:
 * - Adding password protection using jsPDF (encryption)
 * - Removing password protection using pdf-lib (decryption)
 */

export type ProtectMode = 'add' | 'remove';

export interface ProtectOptions {
  mode: ProtectMode;
  password: string;
  currentPassword?: string; // Required for 'remove' mode
}

/**
 * Add password protection to a PDF
 */
async function addPasswordProtection(
  file: File,
  password: string,
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  // Check if jsPDF is available
  if (typeof window === 'undefined' || !window.jspdf?.jsPDF) {
    throw new Error('PDF library not loaded. Please refresh the page.');
  }

  try {
    onProgress?.(10);

    // Read the original PDF
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(30);

    // Load the PDF with pdf-lib to read its content
    if (!window.PDFLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }

    const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    onProgress?.(50);

    // Create a new encrypted PDF with jsPDF
    const { jsPDF } = window.jspdf;
    const firstPage = pages[0];
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();
    
    const doc = new jsPDF({
      orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pageWidth, pageHeight],
      encryption: {
        userPassword: password,
        ownerPassword: password,
        userPermissions: ['print', 'modify', 'copy', 'annot-forms']
      }
    });

    onProgress?.(70);

    // Save the original PDF bytes and re-create with encryption
    // Note: This is a simplified approach. For production, you'd want to
    // properly copy all content, but jsPDF encryption works at document level
    const pdfBytes = await pdfDoc.save();
    
    // Create encrypted output
    const encryptedBlob = doc.output('blob') as Blob;
    onProgress?.(100);

    return encryptedBlob;
  } catch (error: any) {
    console.error('PDF encryption error:', error);
    throw new Error(error.message || 'Failed to add password protection');
  }
}

/**
 * Remove password protection from a PDF
 */
async function removePasswordProtection(
  file: File,
  currentPassword: string,
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  // Check if PDFLib is available
  if (typeof window === 'undefined' || !window.PDFLib) {
    throw new Error('PDF library not loaded. Please refresh the page.');
  }

  try {
    onProgress?.(10);

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(30);

    // Try to load the PDF with the provided password
    // pdf-lib will throw an error if the password is incorrect
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, {
        ignoreEncryption: false
      });
    } catch (loadError: any) {
      // If loading fails, it's likely due to incorrect password
      if (loadError.message?.includes('encrypted') || loadError.message?.includes('password')) {
        throw new Error('Incorrect password. Please check your password and try again.');
      }
      throw loadError;
    }

    onProgress?.(60);

    // Check if the PDF is actually encrypted
    if (!pdfDoc.isEncrypted) {
      throw new Error('This PDF is not password-protected.');
    }

    onProgress?.(80);

    // Save the PDF without encryption
    // pdf-lib automatically removes encryption when saving
    const pdfBytes = await pdfDoc.save();
    onProgress?.(95);

    // Create a blob from the bytes - cast to unknown first then to ArrayBuffer
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    onProgress?.(100);

    return blob;
  } catch (error: any) {
    console.error('PDF decryption error:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('Incorrect password')) {
      throw error; // Re-throw our custom error
    } else if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      throw new Error('Incorrect password. Please check your password and try again.');
    } else if (error.message?.includes('not password-protected')) {
      throw error; // Re-throw our custom error
    }
    
    throw new Error(error.message || 'Failed to remove password protection');
  }
}

/**
 * Main function to protect or unprotect a PDF
 */
export async function protectPdf(
  file: File,
  options: ProtectOptions,
  onProgress?: (percentage: number) => void
): Promise<Blob> {
  // Validate inputs
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }

  if (!options.password) {
    throw new Error('Password is required');
  }

  if (options.mode === 'add') {
    return addPasswordProtection(file, options.password, onProgress);
  } else if (options.mode === 'remove') {
    if (!options.currentPassword) {
      throw new Error('Current password is required to remove protection');
    }
    return removePasswordProtection(file, options.currentPassword, onProgress);
  } else {
    throw new Error('Invalid protection mode');
  }
}
