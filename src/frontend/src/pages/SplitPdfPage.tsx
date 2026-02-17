import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, Scissors, Download } from 'lucide-react';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';
import { splitPdf, SplitOptions } from '../utils/splitPdf';

type SplitMode = 'range' | 'per-page';

export default function SplitPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [startPage, setStartPage] = useState<string>('1');
  const [endPage, setEndPage] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);

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
      toast.error(t('splitPdf.error.invalidFile'));
      return;
    }

    // Load PDF to get page count
    try {
      if (typeof window.PDFLib === 'undefined') {
        toast.error(t('splitPdf.error.libraryNotLoaded'));
        return;
      }

      const { PDFDocument } = window.PDFLib;
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pageCount = pdfDoc.getPageCount();

      setSelectedFile(file);
      setTotalPages(pageCount);
      setStartPage('1');
      setEndPage(pageCount.toString());
      toast.success(t('splitPdf.toast.fileSelected', { pages: pageCount }));
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(t('splitPdf.error.loadFailed'));
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSplit = async () => {
    if (!selectedFile) {
      toast.error(t('splitPdf.error.noFile'));
      return;
    }

    // Validate range mode inputs
    if (splitMode === 'range') {
      const start = parseInt(startPage);
      const end = parseInt(endPage);

      if (isNaN(start) || isNaN(end)) {
        toast.error(t('splitPdf.error.invalidRange'));
        return;
      }

      if (start < 1 || start > totalPages) {
        toast.error(t('splitPdf.error.invalidStartPage', { max: totalPages }));
        return;
      }

      if (end < 1 || end > totalPages) {
        toast.error(t('splitPdf.error.invalidEndPage', { max: totalPages }));
        return;
      }

      if (start > end) {
        toast.error(t('splitPdf.error.startGreaterThanEnd'));
        return;
      }
    }

    setIsSplitting(true);
    setSplitProgress(0);

    try {
      const options: SplitOptions = {
        mode: splitMode,
        startPage: splitMode === 'range' ? parseInt(startPage) : undefined,
        endPage: splitMode === 'range' ? parseInt(endPage) : undefined,
      };

      const results = await splitPdf(selectedFile, options, (progress) => {
        setSplitProgress(progress);
      });

      // Download all resulting PDFs
      for (const result of results) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads to avoid browser blocking
        if (results.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (splitMode === 'range') {
        toast.success(t('splitPdf.toast.successRange'));
      } else {
        toast.success(t('splitPdf.toast.successPerPage', { count: results.length }));
      }
      
      // Reset state
      setSelectedFile(null);
      setTotalPages(0);
      setStartPage('1');
      setEndPage('');
    } catch (error) {
      console.error('Split error:', error);
      toast.error(t('splitPdf.error.splitFailed'));
    } finally {
      setIsSplitting(false);
      setSplitProgress(0);
    }
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('splitPdf.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('splitPdf.subtitle')}</p>
        </div>

        {/* Upload Card */}
        <DragAndDropFileZone
          onFileDrop={handleFileDrop}
          accept=".pdf,application/pdf"
          disabled={isSplitting}
          multiple={false}
          dragOverlayTextSingle={t('splitPdf.dragOverlay')}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('splitPdf.upload.title')}
              </CardTitle>
              <CardDescription>{t('splitPdf.upload.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-file-upload"
                disabled={isSplitting}
              />
              <label htmlFor="pdf-file-upload">
                <Button asChild disabled={isSplitting} size="lg" className="w-full sm:w-auto">
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('splitPdf.upload.button')}
                  </span>
                </Button>
              </label>
              {selectedFile && (
                <div className="p-3 border rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('splitPdf.upload.pageCount', { count: totalPages })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DragAndDropFileZone>

        {/* Split Options */}
        {selectedFile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                {t('splitPdf.options.title')}
              </CardTitle>
              <CardDescription>{t('splitPdf.options.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('splitPdf.options.mode')}</Label>
                <RadioGroup
                  value={splitMode}
                  onValueChange={(value) => setSplitMode(value as SplitMode)}
                  disabled={isSplitting}
                >
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="range" id="mode-range" />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mode-range" className="font-medium cursor-pointer">
                        {t('splitPdf.options.modeRange')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('splitPdf.options.modeRangeDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="per-page" id="mode-per-page" />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mode-per-page" className="font-medium cursor-pointer">
                        {t('splitPdf.options.modePerPage')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('splitPdf.options.modePerPageDesc')}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {splitMode === 'range' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-page">{t('splitPdf.options.startPage')}</Label>
                      <Input
                        id="start-page"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={startPage}
                        onChange={(e) => setStartPage(e.target.value)}
                        disabled={isSplitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-page">{t('splitPdf.options.endPage')}</Label>
                      <Input
                        id="end-page"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={endPage}
                        onChange={(e) => setEndPage(e.target.value)}
                        disabled={isSplitting}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('splitPdf.options.rangeHelp', { max: totalPages })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Split Button */}
        {selectedFile && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSplit}
                disabled={isSplitting}
                size="lg"
                className="w-full"
              >
                {isSplitting ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    {t('splitPdf.split.splitting')}
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-4 w-4" />
                    {t('splitPdf.split.button')}
                  </>
                )}
              </Button>

              {isSplitting && splitProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={splitProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('splitPdf.split.progress', { progress: splitProgress })}
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
