import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileSpreadsheet, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { convertExcelToPdf } from '../utils/excelToPdf';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

export default function ExcelToPdfPage() {
  const { identity } = useInternetIdentity();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const isAuthenticated = !!identity;

  const processFile = async (file: File) => {
    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError(t('excelToPdf.error.invalidFile'));
      toast.error(t('excelToPdf.toast.invalidFileType'));
      return;
    }

    setError(null);
    setConvertedPdfBlob(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse workbook to extract sheet names
      if (typeof window.XLSX === 'undefined') {
        throw new Error(t('excelToPdf.error.libraryNotLoaded'));
      }
      
      const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error(t('excelToPdf.error.emptyFile'));
      }

      // Store file data and sheet names
      setFileBuffer(arrayBuffer);
      setOriginalFileName(file.name);
      setAvailableSheets(workbook.SheetNames);
      
      // Select all sheets by default
      setSelectedSheets(new Set(workbook.SheetNames));
      
      toast.success(t('excelToPdf.toast.fileLoaded', { count: workbook.SheetNames.length }));
    } catch (err: any) {
      console.error('File loading error:', err);
      const errorMessage = err.message || t('excelToPdf.error.loadFailed');
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset state
      setFileBuffer(null);
      setOriginalFileName('');
      setAvailableSheets([]);
      setSelectedSheets(new Set());
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleFileDrop = async (file: File) => {
    await processFile(file);
  };

  const handleSheetToggle = (sheetName: string) => {
    setSelectedSheets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sheetName)) {
        newSet.delete(sheetName);
      } else {
        newSet.add(sheetName);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedSheets(new Set(availableSheets));
  };

  const handleSelectNone = () => {
    setSelectedSheets(new Set());
  };

  const handleConvert = async () => {
    if (!fileBuffer || !originalFileName) {
      setError(t('excelToPdf.error.noFile'));
      return;
    }

    if (selectedSheets.size === 0) {
      setError(t('excelToPdf.error.noSheets'));
      toast.error(t('excelToPdf.error.noSheets'));
      return;
    }

    setError(null);
    setIsConverting(true);

    try {
      // Convert to PDF with selected sheets and orientation
      const selectedSheetArray = Array.from(selectedSheets);
      const pdfBlob = await convertExcelToPdf(fileBuffer, originalFileName, selectedSheetArray, orientation);
      
      // Generate output filename
      const outputFileName = originalFileName.replace(/\.(xlsx|xls)$/i, '.pdf');
      
      setConvertedPdfBlob(pdfBlob);
      setConvertedFileName(outputFileName);
      toast.success(t('excelToPdf.toast.conversionSuccess'));
    } catch (err: any) {
      console.error('Conversion error:', err);
      const errorMessage = err.message || t('excelToPdf.error.conversionFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedPdfBlob) return;

    const url = URL.createObjectURL(convertedPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('excelToPdf.toast.downloadSuccess'));
  };

  const handleReset = () => {
    setConvertedPdfBlob(null);
    setConvertedFileName('');
    setError(null);
    setFileBuffer(null);
    setOriginalFileName('');
    setAvailableSheets([]);
    setSelectedSheets(new Set());
    setOrientation('landscape');
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
    <div className="container px-4 py-12">
      <AdSenseHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                {t('excelToPdf.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('excelToPdf.subtitle')}
              </p>
            </div>

            {/* Main Conversion Card */}
            <DragAndDropFileZone onFileDrop={handleFileDrop} accept=".xlsx,.xls" disabled={isConverting}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t('excelToPdf.upload.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('excelToPdf.upload.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Input */}
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="excel-file-upload"
                      disabled={isConverting}
                    />
                    <label htmlFor="excel-file-upload">
                      <Button asChild disabled={isConverting} size="lg" className="w-full sm:w-auto">
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {isConverting ? t('excelToPdf.upload.converting') : t('excelToPdf.upload.button')}
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* File Loaded - Show Worksheet Selection and Orientation */}
                  {fileBuffer && availableSheets.length > 0 && !convertedPdfBlob && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{t('excelToPdf.fileLoaded')}</h3>
                          <p className="text-sm text-muted-foreground">{originalFileName}</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">{t('excelToPdf.selectSheets')}</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={isConverting}>
                              {t('excelToPdf.selectAll')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleSelectNone} disabled={isConverting}>
                              {t('excelToPdf.selectNone')}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {availableSheets.map((sheetName) => (
                            <div key={sheetName} className="flex items-center space-x-2">
                              <Checkbox
                                id={`sheet-${sheetName}`}
                                checked={selectedSheets.has(sheetName)}
                                onCheckedChange={() => handleSheetToggle(sheetName)}
                                disabled={isConverting}
                              />
                              <Label
                                htmlFor={`sheet-${sheetName}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {sheetName}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">{t('excelToPdf.orientation.label')}</Label>
                        <RadioGroup value={orientation} onValueChange={(value) => setOrientation(value as 'portrait' | 'landscape')} disabled={isConverting}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="portrait" id="portrait" />
                            <Label htmlFor="portrait" className="font-normal cursor-pointer">
                              {t('excelToPdf.orientation.portrait')}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="landscape" id="landscape" />
                            <Label htmlFor="landscape" className="font-normal cursor-pointer">
                              {t('excelToPdf.orientation.landscape')}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button
                        onClick={handleConvert}
                        disabled={isConverting || selectedSheets.size === 0}
                        className="w-full"
                        size="lg"
                      >
                        {isConverting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t('excelToPdf.convert.converting')}
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {t('excelToPdf.convert.button')}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Conversion Success */}
                  {convertedPdfBlob && (
                    <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                            {t('excelToPdf.success.title')}
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {t('excelToPdf.success.description')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleDownload} className="flex-1" size="lg">
                          <Download className="mr-2 h-4 w-4" />
                          {t('excelToPdf.success.download')}
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="flex-1" size="lg">
                          {t('excelToPdf.success.convertAnother')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DragAndDropFileZone>
          </div>

          <AdSenseSidebar />
        </div>
      </div>
    </div>
  );
}
