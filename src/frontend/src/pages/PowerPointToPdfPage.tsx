import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Presentation, Upload, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/useI18n';
import { convertPowerPointToPdf, isValidPowerPointFile } from '../utils/powerPointToPdf';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

type ConversionState = 'idle' | 'converting' | 'success' | 'error';

export default function PowerPointToPdfPage() {
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
    if (!isValidPowerPointFile(file)) {
      setError(t('powerPointToPdf.error.invalidFile'));
      toast.error(t('powerPointToPdf.toast.invalidFileType'));
      return;
    }

    setSelectedFile(file);
    setConversionState('idle');
    setError('');
    setPdfBlob(null);
    toast.success(t('powerPointToPdf.toast.fileSelected'));
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError(t('powerPointToPdf.error.noFile'));
      return;
    }

    setConversionState('converting');
    setProgress(0);
    setError('');

    try {
      const blob = await convertPowerPointToPdf(selectedFile, {
        onProgress: (percentage) => {
          setProgress(percentage);
        },
      });

      setPdfBlob(blob);
      setConversionState('success');
      toast.success(t('powerPointToPdf.toast.conversionSuccess'));
    } catch (err) {
      console.error('Conversion error:', err);
      const errorMessage = err instanceof Error ? err.message : t('powerPointToPdf.error.conversionFailed');
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
    a.download = selectedFile.name.replace(/\.(pptx|ppt)$/i, '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('powerPointToPdf.toast.downloadSuccess'));
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
            <CardTitle>{t('powerPointToPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('powerPointToPdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <AdSenseHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Presentation className="h-8 w-8 text-primary" />
                {t('powerPointToPdf.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('powerPointToPdf.subtitle')}
              </p>
            </div>

            {/* Main Conversion Card */}
            <DragAndDropFileZone 
              onFileDrop={handleFileDrop} 
              accept=".ppt,.pptx" 
              disabled={conversionState === 'converting'}
              dragOverlayTextSingle={t('powerPointToPdf.dragOverlay')}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t('powerPointToPdf.upload.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('powerPointToPdf.upload.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Input */}
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".ppt,.pptx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="powerpoint-file-upload"
                      disabled={conversionState === 'converting'}
                    />
                    <label htmlFor="powerpoint-file-upload">
                      <Button 
                        asChild 
                        disabled={conversionState === 'converting'} 
                        size="lg" 
                        className="w-full sm:w-auto"
                      >
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {conversionState === 'converting' 
                            ? t('powerPointToPdf.upload.converting') 
                            : t('powerPointToPdf.upload.button')}
                        </span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        {t('powerPointToPdf.upload.selected')}: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Convert Button */}
                  {selectedFile && conversionState === 'idle' && (
                    <Button
                      onClick={handleConvert}
                      className="w-full"
                      size="lg"
                    >
                      <Presentation className="mr-2 h-4 w-4" />
                      {t('powerPointToPdf.convert.button')}
                    </Button>
                  )}

                  {/* Conversion Progress */}
                  {conversionState === 'converting' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t('powerPointToPdf.progress.converting')}
                          </span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  )}

                  {/* Conversion Success */}
                  {conversionState === 'success' && pdfBlob && (
                    <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                            {t('powerPointToPdf.success.title')}
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {t('powerPointToPdf.success.description')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleDownload} className="flex-1" size="lg">
                          <Download className="mr-2 h-4 w-4" />
                          {t('powerPointToPdf.success.download')}
                        </Button>
                        <Button onClick={handleConvertAnother} variant="outline" className="flex-1" size="lg">
                          {t('powerPointToPdf.success.convertAnother')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DragAndDropFileZone>

            {/* How It Works Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('powerPointToPdf.howItWorks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>{t('powerPointToPdf.step1')}</li>
                  <li>{t('powerPointToPdf.step2')}</li>
                  <li>{t('powerPointToPdf.step3')}</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <AdSenseSidebar />
        </div>
      </div>
    </div>
  );
}
