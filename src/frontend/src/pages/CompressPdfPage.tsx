import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Download, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';
import { compressPdf } from '../utils/compressPdf';

export default function CompressPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const isAuthenticated = !!identity;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const handleFileDrop = async (file: File) => {
    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error(t('compressPdf.error.invalidFile'));
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    setCompressedSize(0);
    toast.success(t('compressPdf.toast.fileSelected'));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      toast.error(t('compressPdf.error.noFile'));
      return;
    }

    setIsCompressing(true);
    setCompressProgress(0);

    try {
      const compressedBlob = await compressPdf(selectedFile, (progress) => {
        setCompressProgress(progress);
      });

      setCompressedSize(compressedBlob.size);

      // Download the compressed PDF
      const url = URL.createObjectURL(compressedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name.replace('.pdf', '_compressed.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const reduction = ((originalSize - compressedBlob.size) / originalSize) * 100;
      toast.success(t('compressPdf.toast.success', { reduction: reduction.toFixed(1) }));
      
      // Reset state
      setSelectedFile(null);
      setOriginalSize(0);
      setCompressedSize(0);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error(t('compressPdf.error.compressFailed'));
    } finally {
      setIsCompressing(false);
      setCompressProgress(0);
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('compressPdf.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('compressPdf.subtitle')}</p>
        </div>

        {/* Upload Card */}
        <DragAndDropFileZone
          onFileDrop={handleFileDrop}
          accept=".pdf,application/pdf"
          disabled={isCompressing}
          multiple={false}
          dragOverlayTextSingle={t('compressPdf.dragOverlay')}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('compressPdf.upload.title')}
              </CardTitle>
              <CardDescription>{t('compressPdf.upload.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-file-upload"
                disabled={isCompressing}
              />
              <label htmlFor="pdf-file-upload">
                <Button asChild disabled={isCompressing} size="lg" className="w-full sm:w-auto">
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('compressPdf.upload.button')}
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        </DragAndDropFileZone>

        {/* Selected File Display */}
        {selectedFile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('compressPdf.file.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('compressPdf.file.originalSize')}: {formatFileSize(originalSize)}
                    </p>
                  </div>
                  <Minimize2 className="h-5 w-5 text-muted-foreground ml-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compress Button */}
        {selectedFile && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleCompress}
                disabled={isCompressing}
                size="lg"
                className="w-full"
              >
                {isCompressing ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    {t('compressPdf.compress.compressing')}
                  </>
                ) : (
                  <>
                    <Minimize2 className="mr-2 h-4 w-4" />
                    {t('compressPdf.compress.button')}
                  </>
                )}
              </Button>

              {isCompressing && compressProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={compressProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('compressPdf.compress.progress', { progress: compressProgress })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
