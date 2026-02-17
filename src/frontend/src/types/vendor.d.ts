// Type declarations for globally loaded libraries from CDN

// SheetJS (xlsx) library
declare global {
  interface Window {
    XLSX: {
      read: (data: ArrayBuffer, options?: { type: string }) => any;
      utils: {
        sheet_to_json: (sheet: any, options?: { header?: number }) => any[];
      };
    };
  }
}

// jsPDF library with encryption support
declare module 'jspdf' {
  export interface jsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: string;
    format?: string | number[];
    compress?: boolean;
    encryption?: {
      userPassword?: string;
      ownerPassword?: string;
      userPermissions?: string[];
    };
  }

  export class jsPDF {
    constructor(options?: jsPDFOptions);
    text(text: string, x: number, y: number): void;
    addPage(): void;
    autoTable(options: any): void;
    save(filename: string): void;
    output(type: 'blob' | 'arraybuffer' | 'datauristring'): Blob | ArrayBuffer | string;
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}

declare global {
  interface Window {
    jspdf: {
      jsPDF: typeof import('jspdf').jsPDF;
    };
  }
}

// pdf-lib library
declare global {
  interface Window {
    PDFLib: {
      PDFDocument: {
        load(data: ArrayBuffer, options?: { ignoreEncryption?: boolean }): Promise<PDFDocument>;
        create(): Promise<PDFDocument>;
      };
      degrees(angle: number): { angle: number };
    };
  }

  interface PDFDocument {
    getPages(): PDFPage[];
    copyPages(srcDoc: PDFDocument, pageIndices: number[]): Promise<PDFPage[]>;
    addPage(page?: PDFPage): PDFPage;
    save(options?: { useObjectStreams?: boolean }): Promise<Uint8Array>;
    getPageCount(): number;
    removePage(index: number): void;
    isEncrypted: boolean;
  }

  interface PDFPage {
    getRotation(): { angle: number };
    setRotation(rotation: { angle: number }): void;
    getWidth(): number;
    getHeight(): number;
  }
}

export {};
