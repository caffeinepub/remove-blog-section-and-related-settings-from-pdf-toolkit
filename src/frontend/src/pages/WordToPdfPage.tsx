import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/useI18n';
import { convertWordToPdf, isValidWordFile } from '../utils/wordToPdf';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

type ConversionState = 'idle' | 'converting' | 'success' | 'error';

export default function WordToPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionState, setConversionState] = useState<ConversionState>('idle');
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');

  const isAuthenticated = !!identity;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileDrop = (file: File) => {
    handleFile(file);
  };

  const handleFile = (file: File) => {
    if (!isValidWordFile(file)) {
      setError(t('wordToPdf.error.invalidFile'));
      toast.error(t('wordToPdf.toast.invalidFileType'));
      return;
    }

    setSelectedFile(file);
    setConversionState('idle');
    setError('');
    setPdfBlob(null);
    toast.success(t('wordToPdf.toast.fileSelected'));
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError(t('wordToPdf.error.noFile'));
      return;
    }

    setConversionState('converting');
    setProgress(0);
    setError('');

    try {
      const blob = await convertWordToPdf(selectedFile, {
        onProgress: (percentage) => {
          setProgress(percentage);
        },
      });

      setPdfBlob(blob);
      setConversionState('success');
      toast.success(t('wordToPdf.toast.conversionSuccess'));
    } catch (err) {
      console.error('Conversion error:', err);
      const errorMessage = err instanceof Error ? err.message : t('wordToPdf.error.conversionFailed');
      setError(errorMessage);
      setConversionState('error');
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !selectedFile) return;

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name.replace(/\.docx$/i, '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('wordToPdf.toast.downloadSuccess'));
  };

  const handleConvertAnother = () => {
    setSelectedFile(null);
    setConversionState('idle');
    setProgress(0);
    setPdfBlob(null);
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('wordToPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('wordToPdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isConverting = conversionState === 'converting';
  const isSuccess = conversionState === 'success';

  return (
    <div className="container px-4 py-8 md:py-12">
      <AdSenseHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
          <div>
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('wordToPdf.title')}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{t('wordToPdf.subtitle')}</p>
            </div>

            {!isSuccess ? (
              <>
                {/* Upload Section */}
                <DragAndDropFileZone
                  onFileDrop={handleFileDrop}
                  accept=".docx"
                  disabled={isConverting}
                  dragOverlayTextSingle={t('wordToPdf.dragOverlay')}
                >
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {t('wordToPdf.upload.title')}
                      </CardTitle>
                      <CardDescription>{t('wordToPdf.upload.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4">
                        <input
                          type="file"
                          accept=".docx"
                          onChange={handleFileSelect}
                          disabled={isConverting}
                          className="hidden"
                          id="word-file-input"
                        />
                        <label htmlFor="word-file-input" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={isConverting}
                            asChild
                          >
                            <span>
                              <FileText className="mr-2 h-4 w-4" />
                              {t('wordToPdf.upload.button')}
                            </span>
                          </Button>
                        </label>
                        <p className="text-sm text-muted-foreground">{t('wordToPdf.upload.dragDrop')}</p>
                        {selectedFile && (
                          <div className="w-full p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </DragAndDropFileZone>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Convert Button */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleConvert}
                      disabled={!selectedFile || isConverting}
                      className="w-full"
                      size="lg"
                    >
                      {isConverting ? t('wordToPdf.convert.converting') : t('wordToPdf.convert.button')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Progress */}
                {isConverting && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('wordToPdf.convert.converting')}</CardTitle>
                      <CardDescription>
                        {t('wordToPdf.convert.progress', { progress: Math.round(progress) })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="w-full" />
                    </CardContent>
                  </Card>
                )}

                {/* How It Works */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t('wordToPdf.howItWorks')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>{t('wordToPdf.step1')}</li>
                      <li>{t('wordToPdf.step2')}</li>
                      <li>{t('wordToPdf.step3')}</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Success State */
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">{t('wordToPdf.success.title')}</CardTitle>
                  <CardDescription>{t('wordToPdf.success.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleDownload} className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    {t('wordToPdf.success.download')}
                  </Button>
                  <Button onClick={handleConvertAnother} variant="outline" className="w-full">
                    {t('wordToPdf.success.convertAnother')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <AdSenseSidebar />
        </div>
      </div>
    </div>
  );
}
