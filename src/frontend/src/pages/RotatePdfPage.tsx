import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RotateCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/useI18n';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { rotatePdf, RotationAngle } from '../utils/rotatePdf';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

export default function RotatePdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const isAuthenticated = !!identity;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        toast.success(t('rotatePdf.toast.fileSelected'));
      } else {
        toast.error(t('rotatePdf.error.invalidFile'));
      }
    }
  };

  const handleFileDrop = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      toast.success(t('rotatePdf.toast.fileSelected'));
    } else {
      toast.error(t('rotatePdf.error.invalidFile'));
    }
  };

  const handleRotate = async () => {
    if (!selectedFile) {
      toast.error(t('rotatePdf.error.noFile'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const rotatedBlob = await rotatePdf(selectedFile, rotationAngle, (progressValue) => {
        setProgress(progressValue);
      });

      // Download the rotated PDF
      const url = URL.createObjectURL(rotatedBlob);
      const a = document.createElement('a');
      a.href = url;
      const originalName = selectedFile.name.replace('.pdf', '');
      a.download = `${originalName}-rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('rotatePdf.toast.success'));

      // Reset form
      setSelectedFile(null);
      setRotationAngle(90);
      setProgress(0);
    } catch (error: any) {
      console.error('Rotation error:', error);
      toast.error(error.message || t('rotatePdf.error.rotateFailed'));
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('rotatePdf.loginRequired')}</CardTitle>
            <CardDescription>{t('rotatePdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('rotatePdf.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('rotatePdf.subtitle')}</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('rotatePdf.upload.title')}
            </CardTitle>
            <CardDescription>{t('rotatePdf.upload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DragAndDropFileZone
              onFileDrop={handleFileDrop}
              accept="application/pdf"
              multiple={false}
              dragOverlayTextSingle={t('rotatePdf.dragOverlay')}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCw className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedFile ? selectedFile.name : t('rotatePdf.upload.selectFile')}
                  </p>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isProcessing}
                  />
                  <Label htmlFor="pdf-upload">
                    <Button variant="outline" asChild disabled={isProcessing}>
                      <span>{t('rotatePdf.upload.button')}</span>
                    </Button>
                  </Label>
                </div>
              </div>
            </DragAndDropFileZone>
          </CardContent>
        </Card>

        {/* Rotation Angle Section */}
        {selectedFile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('rotatePdf.angle.title')}</CardTitle>
              <CardDescription>{t('rotatePdf.angle.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={rotationAngle.toString()}
                onValueChange={(value) => setRotationAngle(parseInt(value) as RotationAngle)}
                disabled={isProcessing}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90" id="angle-90" />
                  <Label htmlFor="angle-90" className="cursor-pointer">
                    {t('rotatePdf.angle.90')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="180" id="angle-180" />
                  <Label htmlFor="angle-180" className="cursor-pointer">
                    {t('rotatePdf.angle.180')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="270" id="angle-270" />
                  <Label htmlFor="angle-270" className="cursor-pointer">
                    {t('rotatePdf.angle.270')}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Progress Section */}
        {isProcessing && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('rotatePdf.progress.processing')}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {selectedFile && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleRotate}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  {t('rotatePdf.rotate.rotating')}
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  {t('rotatePdf.rotate.button')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
