import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Trash2, ArrowUp, ArrowDown, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';
import { mergePdfs } from '../utils/mergePdf';

interface PdfFile {
  id: string;
  file: File;
  size: number;
}

export default function MergePdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const isAuthenticated = !!identity;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
  };

  const handleFilesDrop = async (files: File[]) => {
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const validFiles: PdfFile[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          size: file.size,
        });
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(t('mergePdf.error.invalidFiles', { count: invalidFiles.length }));
    }

    if (validFiles.length > 0) {
      setPdfFiles((prev) => [...prev, ...validFiles]);
      toast.success(t('mergePdf.toast.filesAdded', { count: validFiles.length }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error(t('mergePdf.error.minFiles'));
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);

    try {
      const files = pdfFiles.map((pf) => pf.file);
      const mergedBlob = await mergePdfs(files, (progress) => {
        setMergeProgress(progress);
      });

      // Download the merged PDF
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('mergePdf.toast.success'));
      setPdfFiles([]);
    } catch (error) {
      console.error('Merge error:', error);
      toast.error(t('mergePdf.error.mergeFailed'));
    } finally {
      setIsMerging(false);
      setMergeProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('excelToPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('excelToPdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('mergePdf.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('mergePdf.subtitle')}</p>
        </div>

        {/* Upload Card */}
        <DragAndDropFileZone
          onFilesDrop={handleFilesDrop}
          accept=".pdf,application/pdf"
          disabled={isMerging}
          multiple={true}
          dragOverlayTextSingle={t('mergePdf.dragOverlaySingle')}
          dragOverlayTextMultiple={t('mergePdf.dragOverlayMultiple')}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('mergePdf.upload.title')}
              </CardTitle>
              <CardDescription>{t('mergePdf.upload.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-files-upload"
                disabled={isMerging}
                multiple
              />
              <label htmlFor="pdf-files-upload">
                <Button asChild disabled={isMerging} size="lg" className="w-full sm:w-auto">
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('mergePdf.upload.button')}
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        </DragAndDropFileZone>

        {/* Files List */}
        {pdfFiles.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('mergePdf.list.title')} ({pdfFiles.length})
              </CardTitle>
              <CardDescription>{t('mergePdf.list.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pdfFiles.map((pdfFile, index) => (
                  <div
                    key={pdfFile.id}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdfFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(pdfFile.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isMerging}
                        title={t('mergePdf.list.moveUp')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === pdfFiles.length - 1 || isMerging}
                        title={t('mergePdf.list.moveDown')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(pdfFile.id)}
                        disabled={isMerging}
                        title={t('mergePdf.list.remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Merge Button */}
        {pdfFiles.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleMerge}
                disabled={isMerging || pdfFiles.length < 2}
                size="lg"
                className="w-full"
              >
                {isMerging ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    {t('mergePdf.merge.merging')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('mergePdf.merge.button')}
                  </>
                )}
              </Button>

              {isMerging && mergeProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={mergeProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('mergePdf.merge.progress', { progress: mergeProgress })}
                  </p>
                </div>
              )}

              {pdfFiles.length === 1 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  {t('mergePdf.merge.needMore')}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
