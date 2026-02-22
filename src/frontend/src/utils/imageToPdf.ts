export interface LayoutOptions {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fitMode: 'contain' | 'cover';
  alignment: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'middle' | 'bottom';
  };
}

export async function convertImagesToPdf(
  imageFiles: File[],
  options: LayoutOptions
): Promise<Blob> {
  if (typeof window === 'undefined' || !window.jsPDF) {
    throw new Error('jsPDF library not loaded. Please refresh the page.');
  }

  const { jsPDF } = window.jsPDF;

  // Page dimensions in mm
  const pageSizes = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
  };

  const pageSize = pageSizes[options.pageSize];
  const { width: pageWidth, height: pageHeight } =
    options.orientation === 'portrait'
      ? pageSize
      : { width: pageSize.height, height: pageSize.width };

  // Create PDF
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.pageSize.toLowerCase(),
  });

  // Calculate content area
  const contentWidth = pageWidth - options.margins.left - options.margins.right;
  const contentHeight = pageHeight - options.margins.top - options.margins.bottom;

  for (let i = 0; i < imageFiles.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }

    const imageFile = imageFiles[i];
    const imageData = await readFileAsDataURL(imageFile);

    // Get image dimensions
    const imgDimensions = await getImageDimensions(imageData);
    const imgAspect = imgDimensions.width / imgDimensions.height;
    const contentAspect = contentWidth / contentHeight;

    let imgWidth: number;
    let imgHeight: number;

    if (options.fitMode === 'contain') {
      // Fit image within content area
      if (imgAspect > contentAspect) {
        imgWidth = contentWidth;
        imgHeight = contentWidth / imgAspect;
      } else {
        imgHeight = contentHeight;
        imgWidth = contentHeight * imgAspect;
      }
    } else {
      // Cover content area
      if (imgAspect > contentAspect) {
        imgHeight = contentHeight;
        imgWidth = contentHeight * imgAspect;
      } else {
        imgWidth = contentWidth;
        imgHeight = contentWidth / imgAspect;
      }
    }

    // Calculate position based on alignment
    let x = options.margins.left;
    let y = options.margins.top;

    switch (options.alignment.horizontal) {
      case 'center':
        x += (contentWidth - imgWidth) / 2;
        break;
      case 'right':
        x += contentWidth - imgWidth;
        break;
    }

    switch (options.alignment.vertical) {
      case 'middle':
        y += (contentHeight - imgHeight) / 2;
        break;
      case 'bottom':
        y += contentHeight - imgHeight;
        break;
    }

    pdf.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight);
  }

  return pdf.output('blob');
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataURL;
  });
}
