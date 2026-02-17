/**
 * Client-side Image-to-PDF conversion utility using jsPDF
 * Converts multiple images to a single PDF document with customizable layout options
 */

export interface ImageToPdfOptions {
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter';
  marginMm?: number;
  fitMode?: 'contain' | 'cover';
  alignment?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Convert multiple images to a single PDF with customizable layout
 * Each image is placed on its own page with specified layout options
 */
export async function convertImagesToPdf(
  images: File[],
  options: ImageToPdfOptions = {}
): Promise<Blob> {
  if (!images || images.length === 0) {
    throw new Error('No images provided for conversion');
  }

  // Check if jsPDF is loaded
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    throw new Error('PDF library not loaded. Please refresh the page and try again.');
  }

  const { jsPDF } = window.jspdf;

  // Default options
  const orientation = options.orientation || 'portrait';
  const pageSize = options.pageSize || 'A4';
  const marginMm = options.marginMm !== undefined ? options.marginMm : 10;
  const fitMode = options.fitMode || 'contain';
  const alignment = options.alignment || 'center';

  // Validate margins
  if (marginMm < 0) {
    throw new Error('INVALID_MARGIN_NEGATIVE');
  }

  // Page dimensions in mm based on size and orientation
  let pageWidth: number;
  let pageHeight: number;

  if (pageSize === 'A4') {
    pageWidth = orientation === 'portrait' ? 210 : 297;
    pageHeight = orientation === 'portrait' ? 297 : 210;
  } else { // Letter
    pageWidth = orientation === 'portrait' ? 215.9 : 279.4;
    pageHeight = orientation === 'portrait' ? 279.4 : 215.9;
  }

  // Validate margins don't exceed page dimensions
  if (marginMm * 2 >= pageWidth || marginMm * 2 >= pageHeight) {
    throw new Error('INVALID_MARGIN_TOO_LARGE');
  }

  const maxWidth = pageWidth - 2 * marginMm;
  const maxHeight = pageHeight - 2 * marginMm;

  // Create new PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize.toLowerCase() as 'a4' | 'letter',
  });

  let isFirstPage = true;

  for (const imageFile of images) {
    try {
      // Validate image type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error(`Invalid file type: ${imageFile.name}. Only image files are supported.`);
      }

      // Load image
      const imageData = await loadImage(imageFile);

      // Add new page for subsequent images
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Calculate scaled dimensions based on fit mode
      const imgWidth = imageData.width;
      const imgHeight = imageData.height;
      const aspectRatio = imgWidth / imgHeight;

      let scaledWidth: number;
      let scaledHeight: number;

      if (fitMode === 'contain') {
        // Fit entire image within bounds, preserving aspect ratio
        scaledWidth = maxWidth;
        scaledHeight = maxWidth / aspectRatio;

        if (scaledHeight > maxHeight) {
          scaledHeight = maxHeight;
          scaledWidth = maxHeight * aspectRatio;
        }
      } else {
        // Cover: fill entire area, may crop image
        scaledWidth = maxWidth;
        scaledHeight = maxWidth / aspectRatio;

        if (scaledHeight < maxHeight) {
          scaledHeight = maxHeight;
          scaledWidth = maxHeight * aspectRatio;
        }
      }

      // Calculate position based on alignment
      let x: number;
      let y: number;

      // Horizontal alignment
      if (alignment.includes('left')) {
        x = marginMm;
      } else if (alignment.includes('right')) {
        x = pageWidth - marginMm - scaledWidth;
      } else {
        // center (default)
        x = (pageWidth - scaledWidth) / 2;
      }

      // Vertical alignment
      if (alignment.includes('top')) {
        y = marginMm;
      } else if (alignment.includes('bottom')) {
        y = pageHeight - marginMm - scaledHeight;
      } else {
        // center (default)
        y = (pageHeight - scaledHeight) / 2;
      }

      // For cover mode, we may need to clip the image
      if (fitMode === 'cover') {
        // Ensure image doesn't exceed drawable area
        const clipX = Math.max(marginMm, x);
        const clipY = Math.max(marginMm, y);
        const clipWidth = Math.min(scaledWidth, maxWidth);
        const clipHeight = Math.min(scaledHeight, maxHeight);

        // Add image with clipping
        pdf.addImage(
          imageData.dataUrl,
          imageData.format,
          clipX,
          clipY,
          clipWidth,
          clipHeight,
          undefined,
          'FAST'
        );
      } else {
        // Add image normally for contain mode
        pdf.addImage(imageData.dataUrl, imageData.format, x, y, scaledWidth, scaledHeight);
      }
    } catch (error: any) {
      console.error(`Error processing image ${imageFile.name}:`, error);
      throw new Error(`Failed to process image "${imageFile.name}": ${error.message}`);
    }
  }

  // Generate PDF blob
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
}

interface ImageData {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Load an image file and return its data URL and dimensions
 */
function loadImage(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read image file'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        // Determine image format from MIME type
        let format = 'JPEG';
        if (file.type === 'image/png') {
          format = 'PNG';
        } else if (file.type === 'image/gif') {
          format = 'GIF';
        } else if (file.type === 'image/webp') {
          format = 'WEBP';
        }

        resolve({
          dataUrl,
          width: img.width,
          height: img.height,
          format,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
