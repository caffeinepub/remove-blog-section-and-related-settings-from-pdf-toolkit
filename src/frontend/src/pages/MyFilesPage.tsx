import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerFiles, useUploadFile, useDeleteFile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, Trash2, Layers, Minimize2, Lock, RotateCw, RefreshCw, Image, FileSpreadsheet, FileType } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { useI18n } from '../i18n/useI18n';
import { Link } from '@tanstack/react-router';

export default function MyFilesPage() {
  const { identity } = useInternetIdentity();
  const { t, locale } = useI18n();
  const { data: files, isLoading } = useGetCallerFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isAuthenticated = !!identity;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('myFiles.upload.noFile'));
      return;
    }

    setIsUploading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await uploadFile.mutateAsync({
        fileName: selectedFile.name,
        blob,
      });

      toast.success(t('myFiles.upload.success'));
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || t('myFiles.upload.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string, blob: ExternalBlob) => {
    try {
      const url = blob.getDirectURL();
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(t('myFiles.download.success'));
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || t('myFiles.download.error'));
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm(t('myFiles.delete.confirm'))) {
      return;
    }

    try {
      await deleteFile.mutateAsync(fileId);
      toast.success(t('myFiles.delete.success'));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || t('myFiles.delete.error'));
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('myFiles.loginRequired')}</CardTitle>
            <CardDescription>{t('myFiles.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('myFiles.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('myFiles.subtitle')}</p>
        </div>

        {/* Tools Section */}
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle>{t('myFiles.tools.title')}</CardTitle>
            <CardDescription>{t('myFiles.tools.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Link to="/tools/convert-into-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <RefreshCw className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.convertIntoPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.convertIntoPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/excel-to-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <FileSpreadsheet className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.excelToPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.excelToPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/image-to-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <Image className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.imageToPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.imageToPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/word-to-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <FileType className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.wordToPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.wordToPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/merge-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <Layers className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.mergePdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.mergePdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/compress-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <Minimize2 className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.compressPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.compressPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/split-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.splitPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.splitPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/protect-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <Lock className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.protectPdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.protectPdfDesc')}</div>
                  </div>
                </Button>
              </Link>

              <Link to="/tools/rotate-pdf">
                <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                  <RotateCw className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{t('myFiles.tools.rotatePdf')}</div>
                    <div className="text-xs text-muted-foreground">{t('myFiles.tools.rotatePdfDesc')}</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('myFiles.upload.title')}
            </CardTitle>
            <CardDescription>{t('myFiles.upload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload" className="sr-only">
                  {t('myFiles.upload.selectFile')}
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('myFiles.upload.selected')}: {selectedFile.name}
                  </p>
                )}
              </div>
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? t('myFiles.upload.uploading') : t('myFiles.upload.button')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('myFiles.list.title')}
            </CardTitle>
            <CardDescription>{t('myFiles.list.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">{t('myFiles.list.loading')}</p>
            ) : files && files.length > 0 ? (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{file.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('myFiles.list.uploaded')}: {formatDate(file.uploadTime)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id, file.fileName, file.blob)}
                      >
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('myFiles.list.download')}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleteFile.isPending}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('myFiles.list.delete')}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">{t('myFiles.list.empty')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
