import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DragAndDropFileZoneProps {
  onFileDrop?: (file: File) => void;
  onFilesDrop?: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
  children: React.ReactNode;
  className?: string;
  dragOverlayTextSingle?: string;
  dragOverlayTextMultiple?: string;
}

export default function DragAndDropFileZone({
  onFileDrop,
  onFilesDrop,
  accept,
  disabled = false,
  multiple = false,
  children,
  className,
  dragOverlayTextSingle = 'Drop file here',
  dragOverlayTextMultiple = 'Drop files here',
}: DragAndDropFileZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only reset if leaving the drop zone itself, not child elements
      if (e.currentTarget === e.target) {
        setIsDragOver(false);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        e.dataTransfer.dropEffect = 'copy';
      }
    },
    [disabled]
  );

  const validateFile = (file: File): boolean => {
    if (!accept) return true;

    const acceptedTypes = accept.split(',').map((type) => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    return acceptedTypes.some((type) => {
      // Handle wildcard patterns like "image/*"
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      // Handle exact MIME types or extensions
      return type === fileExtension || file.type === type;
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // Filter valid files
      const validFiles = files.filter(validateFile);

      if (validFiles.length === 0) {
        // No valid files - silently return, let parent handle validation
        return;
      }

      // Handle multiple files or single file based on props
      if (multiple && onFilesDrop) {
        onFilesDrop(validFiles);
      } else if (onFileDrop) {
        // Single file mode - use first valid file
        onFileDrop(validFiles[0]);
      } else if (onFilesDrop) {
        // Fallback to onFilesDrop if only that is provided
        onFilesDrop(validFiles);
      }
    },
    [disabled, accept, multiple, onFileDrop, onFilesDrop]
  );

  const overlayText = multiple ? dragOverlayTextMultiple : dragOverlayTextSingle;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative transition-all duration-200',
        isDragOver && !disabled && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none z-10">
          <p className="text-lg font-semibold text-primary">{overlayText}</p>
        </div>
      )}
    </div>
  );
}
