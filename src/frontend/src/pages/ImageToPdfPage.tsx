import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { useI18n } from '../i18n/useI18n';
import { convertImagesToPdf, LayoutOptions } from '../utils/imageToPdf';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function ImageToPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  
  // Layout options
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginTop, setMarginTop] = useState('10');
  const [marginRight, setMarginRight] = useState('10');
  const [marginBottom, setMarginBottom] = useState('10');
  const [marginLeft, setMarginLeft] = useState('10');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [alignmentH, setAlignmentH] = useState<'left' | 'center' | 'right'>('center');
  const [alignmentV, setAlignmentV] = useState<'top' | 'middle' | 'bottom'>('middle');

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
    const validFiles: ImageFile[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
        });
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(t('imageToPdf.error.invalidFiles', { count: invalidFiles.length }));
    }

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
      toast.success(t('imageToPdf.toast.filesAdded', { count: validFiles.length }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setImageFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImageFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === imageFiles.length - 1) return;
    setImageFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  };

  const handleConvert = async () => {
    if (imageFiles.length === 0) {
      toast.error(t('imageToPdf.error.noImages'));
      return;
    }

    // Validate margins
    const margins = [marginTop, marginRight, marginBottom, marginLeft].map(Number);
    if (margins.some((m) => isNaN(m) || m < 0 || m > 50)) {
      toast.error(t('imageToPdf.error.invalidMargins'));
      return;
    }

    setIsConverting(true);
    setConvertProgress(0);

    try {
      const files = imageFiles.map((img) => img.file);
      const options: LayoutOptions = {
        pageSize,
        orientation,
        margins: {
          top: Number(marginTop),
          right: Number(marginRight),
          bottom: Number(marginBottom),
          left: Number(marginLeft),
        },
        fitMode,
        alignment: {
          horizontal: alignmentH,
          vertical: alignmentV,
        },
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setConvertProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const pdfBlob = await convertImagesToPdf(files, options);

      clearInterval(progressInterval);
      setConvertProgress(100);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('imageToPdf.toast.success'));
      
      // Clean up previews
      imageFiles.forEach((img) => URL.revokeObjectURL(img.preview));
      setImageFiles([]);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(t('imageToPdf.error.conversionFailed'));
    } finally {
      setIsConverting(false);
      setConvertProgress(0);
    }
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
    <div className="container px-4 py-8 md:py-12">
      <AdSenseHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
          <div>
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('imageToPdf.title')}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{t('imageToPdf.subtitle')}</p>
            </div>

            {/* Upload Card */}
            <DragAndDropFileZone
              onFilesDrop={handleFilesDrop}
              accept="image/*"
              disabled={isConverting}
              multiple={true}
              dragOverlayTextSingle={t('imageToPdf.dragOverlaySingle')}
              dragOverlayTextMultiple={t('imageToPdf.dragOverlayMultiple')}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t('imageToPdf.upload.title')}
                  </CardTitle>
                  <CardDescription>{t('imageToPdf.upload.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-files-upload"
                    disabled={isConverting}
                    multiple
                  />
                  <label htmlFor="image-files-upload">
                    <Button asChild disabled={isConverting} size="lg" className="w-full sm:w-auto">
                      <span className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {t('imageToPdf.upload.button')}
                      </span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            </DragAndDropFileZone>

            {/* Images List */}
            {imageFiles.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    {t('imageToPdf.list.title')} ({imageFiles.length})
                  </CardTitle>
                  <CardDescription>{t('imageToPdf.list.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imageFiles.map((imageFile, index) => (
                      <div key={imageFile.id} className="relative group">
                        <img
                          src={imageFile.preview}
                          alt={imageFile.file.name}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0 || isConverting}
                            title={t('imageToPdf.list.moveUp')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === imageFiles.length - 1 || isConverting}
                            title={t('imageToPdf.list.moveDown')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveFile(imageFile.id)}
                            disabled={isConverting}
                            title={t('imageToPdf.list.remove')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-1 truncate">{imageFile.file.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Layout Options */}
            {imageFiles.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t('imageToPdf.layout.title')}</CardTitle>
                  <CardDescription>{t('imageToPdf.layout.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Page Size and Orientation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('imageToPdf.layout.pageSize')}</Label>
                      <Select value={pageSize} onValueChange={(value: 'A4' | 'Letter') => setPageSize(value)} disabled={isConverting}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('imageToPdf.layout.orientation')}</Label>
                      <RadioGroup value={orientation} onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)} disabled={isConverting}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portrait" id="portrait" />
                          <Label htmlFor="portrait" className="font-normal">{t('imageToPdf.layout.portrait')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="landscape" id="landscape" />
                          <Label htmlFor="landscape" className="font-normal">{t('imageToPdf.layout.landscape')}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Margins */}
                  <div className="space-y-2">
                    <Label>{t('imageToPdf.layout.margins')}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <Label htmlFor="marginTop" className="text-xs">{t('imageToPdf.layout.top')}</Label>
                        <Input
                          id="marginTop"
                          type="number"
                          min="0"
                          max="50"
                          value={marginTop}
                          onChange={(e) => setMarginTop(e.target.value)}
                          disabled={isConverting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="marginRight" className="text-xs">{t('imageToPdf.layout.right')}</Label>
                        <Input
                          id="marginRight"
                          type="number"
                          min="0"
                          max="50"
                          value={marginRight}
                          onChange={(e) => setMarginRight(e.target.value)}
                          disabled={isConverting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="marginBottom" className="text-xs">{t('imageToPdf.layout.bottom')}</Label>
                        <Input
                          id="marginBottom"
                          type="number"
                          min="0"
                          max="50"
                          value={marginBottom}
                          onChange={(e) => setMarginBottom(e.target.value)}
                          disabled={isConverting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="marginLeft" className="text-xs">{t('imageToPdf.layout.left')}</Label>
                        <Input
                          id="marginLeft"
                          type="number"
                          min="0"
                          max="50"
                          value={marginLeft}
                          onChange={(e) => setMarginLeft(e.target.value)}
                          disabled={isConverting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fit Mode */}
                  <div className="space-y-2">
                    <Label>{t('imageToPdf.layout.fitMode')}</Label>
                    <RadioGroup value={fitMode} onValueChange={(value: 'contain' | 'cover') => setFitMode(value)} disabled={isConverting}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contain" id="contain" />
                        <Label htmlFor="contain" className="font-normal">{t('imageToPdf.layout.contain')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cover" id="cover" />
                        <Label htmlFor="cover" className="font-normal">{t('imageToPdf.layout.cover')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-2">
                    <Label>{t('imageToPdf.layout.alignment')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['top', 'middle', 'bottom'] as const).map((v) => (
                        <div key={v} className="flex gap-2">
                          {(['left', 'center', 'right'] as const).map((h) => (
                            <Button
                              key={`${v}-${h}`}
                              variant={alignmentV === v && alignmentH === h ? 'default' : 'outline'}
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setAlignmentV(v);
                                setAlignmentH(h);
                              }}
                              disabled={isConverting}
                            >
                              {h[0].toUpperCase()}{v[0].toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            {imageFiles.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleConvert}
                    disabled={isConverting}
                    size="lg"
                    className="w-full"
                  >
                    {isConverting ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-pulse" />
                        {t('imageToPdf.convert.converting')}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t('imageToPdf.convert.button')}
                      </>
                    )}
                  </Button>

                  {isConverting && convertProgress > 0 && (
                    <div className="mt-4 space-y-2">
                      <Progress value={convertProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {t('imageToPdf.convert.progress', { progress: convertProgress })}
                      </p>
                    </div>
                  )}
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
