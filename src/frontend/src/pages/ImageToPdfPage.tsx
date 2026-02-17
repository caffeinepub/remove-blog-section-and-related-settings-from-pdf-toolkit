import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Download, Upload, AlertCircle, CheckCircle2, X, MoveUp, MoveDown, AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal } from 'lucide-react';
import { convertImagesToPdf, ImageToPdfOptions } from '../utils/imageToPdf';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

type Alignment = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function ImageToPdfPage() {
  const { identity } = useInternetIdentity();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [marginMm, setMarginMm] = useState<string>('10');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [alignment, setAlignment] = useState<Alignment>('center');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const isAuthenticated = !!identity;

  const addImages = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error(t('imageToPdf.toast.invalidFileType', { name: file.name }));
      }
      return isImage;
    });

    if (validFiles.length === 0) return;

    const newImages: ImageItem[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setError(null);
    setConvertedPdfBlob(null);
    toast.success(t('imageToPdf.toast.imagesAdded', { count: validFiles.length }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    addImages(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesDrop = (files: File[]) => {
    addImages(files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return newImages;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError(t('imageToPdf.error.noImages'));
      toast.error(t('imageToPdf.error.noImages'));
      return;
    }

    // Validate margin input
    const margin = parseFloat(marginMm);
    if (isNaN(margin) || margin < 0) {
      const errorMsg = t('imageToPdf.error.invalidMargin');
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check if margin is too large for selected page size
    const maxDimension = pageSize === 'A4' 
      ? (orientation === 'portrait' ? 210 : 297)
      : (orientation === 'portrait' ? 215.9 : 279.4);
    
    if (margin * 2 >= maxDimension) {
      const errorMsg = t('imageToPdf.error.marginTooLarge');
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError(null);
    setIsConverting(true);

    try {
      const imageFiles = images.map((img) => img.file);
      const options: ImageToPdfOptions = {
        orientation,
        pageSize,
        marginMm: margin,
        fitMode,
        alignment,
      };

      const pdfBlob = await convertImagesToPdf(imageFiles, options);

      const outputFileName = images.length === 1
        ? images[0].file.name.replace(/\.[^.]+$/, '.pdf')
        : 'images.pdf';

      setConvertedPdfBlob(pdfBlob);
      setConvertedFileName(outputFileName);
      toast.success(t('imageToPdf.toast.conversionSuccess'));
    } catch (err: any) {
      console.error('Conversion error:', err);
      
      // Handle specific error codes
      let errorMessage: string;
      if (err.message === 'INVALID_MARGIN_NEGATIVE') {
        errorMessage = t('imageToPdf.error.invalidMargin');
      } else if (err.message === 'INVALID_MARGIN_TOO_LARGE') {
        errorMessage = t('imageToPdf.error.marginTooLarge');
      } else {
        errorMessage = err.message || t('imageToPdf.error.conversionFailed');
      }
      
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
    toast.success(t('imageToPdf.toast.downloadSuccess'));
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setConvertedPdfBlob(null);
    setConvertedFileName('');
    setError(null);
    setOrientation('portrait');
    setPageSize('A4');
    setMarginMm('10');
    setFitMode('contain');
    setAlignment('center');
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('imageToPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('imageToPdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-primary" />
            {t('imageToPdf.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('imageToPdf.subtitle')}
          </p>
        </div>

        {/* Main Conversion Card */}
        <DragAndDropFileZone
          onFilesDrop={handleFilesDrop}
          accept="image/*"
          disabled={isConverting}
          multiple
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('imageToPdf.upload.title')}
              </CardTitle>
              <CardDescription>
                {t('imageToPdf.upload.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-file-upload"
                  disabled={isConverting}
                />
                <label htmlFor="image-file-upload">
                  <Button asChild disabled={isConverting} size="lg" className="w-full sm:w-auto">
                    <span className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      {isConverting ? t('imageToPdf.upload.converting') : t('imageToPdf.upload.button')}
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

              {/* Images List */}
              {images.length > 0 && !convertedPdfBlob && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{t('imageToPdf.imagesLoaded')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('imageToPdf.imageCount', { count: images.length })}
                      </p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="flex items-center gap-3 p-3 bg-background border rounded-lg"
                      >
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{image.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(image.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveImageUp(index)}
                            disabled={index === 0 || isConverting}
                            title={t('imageToPdf.moveUp')}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveImageDown(index)}
                            disabled={index === images.length - 1 || isConverting}
                            title={t('imageToPdf.moveDown')}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeImage(image.id)}
                            disabled={isConverting}
                            title={t('imageToPdf.remove')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Layout Customization Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h3 className="font-semibold text-base mb-1">{t('imageToPdf.layout.title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('imageToPdf.layout.description')}</p>
                    </div>

                    {/* Page Size */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t('imageToPdf.layout.pageSize')}
                      </Label>
                      <Select
                        value={pageSize}
                        onValueChange={(value) => setPageSize(value as 'A4' | 'Letter')}
                        disabled={isConverting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">{t('imageToPdf.layout.pageSizeA4')}</SelectItem>
                          <SelectItem value="Letter">{t('imageToPdf.layout.pageSizeLetter')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page Orientation */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t('imageToPdf.pageOrientation')}
                      </Label>
                      <RadioGroup
                        value={orientation}
                        onValueChange={(value) => setOrientation(value as 'portrait' | 'landscape')}
                        disabled={isConverting}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portrait" id="orientation-portrait" />
                          <Label htmlFor="orientation-portrait" className="cursor-pointer font-normal">
                            {t('imageToPdf.portrait')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="landscape" id="orientation-landscape" />
                          <Label htmlFor="orientation-landscape" className="cursor-pointer font-normal">
                            {t('imageToPdf.landscape')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Margins */}
                    <div className="space-y-2">
                      <Label htmlFor="margin-input" className="text-sm font-medium">
                        {t('imageToPdf.layout.margins')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="margin-input"
                          type="number"
                          min="0"
                          step="1"
                          value={marginMm}
                          onChange={(e) => setMarginMm(e.target.value)}
                          disabled={isConverting}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">{t('imageToPdf.layout.marginUnit')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('imageToPdf.layout.marginHelp')}</p>
                    </div>

                    {/* Fit Mode */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t('imageToPdf.layout.fitMode')}
                      </Label>
                      <RadioGroup
                        value={fitMode}
                        onValueChange={(value) => setFitMode(value as 'contain' | 'cover')}
                        disabled={isConverting}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="contain" id="fit-contain" />
                          <Label htmlFor="fit-contain" className="cursor-pointer font-normal">
                            {t('imageToPdf.layout.fitContain')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cover" id="fit-cover" />
                          <Label htmlFor="fit-cover" className="cursor-pointer font-normal">
                            {t('imageToPdf.layout.fitCover')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t('imageToPdf.layout.alignment')}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'top-left', label: t('imageToPdf.layout.alignTopLeft') },
                          { value: 'top-center', label: t('imageToPdf.layout.alignTopCenter') },
                          { value: 'top-right', label: t('imageToPdf.layout.alignTopRight') },
                          { value: 'center-left', label: t('imageToPdf.layout.alignCenterLeft') },
                          { value: 'center', label: t('imageToPdf.layout.alignCenter') },
                          { value: 'center-right', label: t('imageToPdf.layout.alignCenterRight') },
                          { value: 'bottom-left', label: t('imageToPdf.layout.alignBottomLeft') },
                          { value: 'bottom-center', label: t('imageToPdf.layout.alignBottomCenter') },
                          { value: 'bottom-right', label: t('imageToPdf.layout.alignBottomRight') },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={alignment === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAlignment(option.value as Alignment)}
                            disabled={isConverting}
                            className="text-xs"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConvert}
                    disabled={isConverting || images.length === 0}
                    size="lg"
                    className="w-full"
                  >
                    {isConverting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('imageToPdf.converting')}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {t('imageToPdf.convertButton')}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Conversion Progress */}
              {isConverting && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('imageToPdf.convertingProgress')}
                  </p>
                </div>
              )}

              {/* Success - Download PDF */}
              {convertedPdfBlob && (
                <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{t('imageToPdf.success')}</h3>
                      <p className="text-sm text-muted-foreground">{convertedFileName}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleDownload} size="lg" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      {t('imageToPdf.download')}
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg">
                      {t('imageToPdf.convertAnother')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DragAndDropFileZone>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t('imageToPdf.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t('imageToPdf.step1')}</p>
            <p>{t('imageToPdf.step2')}</p>
            <p>{t('imageToPdf.step3')}</p>
            <p>{t('imageToPdf.step4')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
