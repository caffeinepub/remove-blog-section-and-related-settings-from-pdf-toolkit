import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Lock, LockOpen, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../i18n/useI18n';
import DragAndDropFileZone from '../components/DragAndDropFileZone';
import { protectPdf, ProtectMode } from '../utils/protectPdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

export default function ProtectPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const [mode, setMode] = useState<ProtectMode>('add');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Add mode fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Remove mode fields
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const isAuthenticated = !!identity;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        toast.success(t('protectPdf.toast.fileSelected'));
      } else {
        toast.error(t('protectPdf.error.invalidFile'));
      }
    }
  };

  const handleFileDrop = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      toast.success(t('protectPdf.toast.fileSelected'));
    } else {
      toast.error(t('protectPdf.error.invalidFile'));
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as ProtectMode);
    // Reset form fields when switching modes
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setSelectedFile(null);
    setProgress(0);
  };

  const isFormValid = () => {
    if (!selectedFile) return false;
    
    if (mode === 'add') {
      return password && confirmPassword && password === confirmPassword;
    } else {
      return currentPassword;
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error(t('protectPdf.error.noFile'));
      return;
    }

    if (mode === 'add') {
      if (!password) {
        toast.error(t('protectPdf.error.emptyPassword'));
        return;
      }

      if (password !== confirmPassword) {
        toast.error(t('protectPdf.error.passwordMismatch'));
        return;
      }
    } else {
      if (!currentPassword) {
        toast.error(t('protectPdf.error.emptyCurrentPassword'));
        return;
      }
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const resultBlob = await protectPdf(
        selectedFile,
        {
          mode,
          password: mode === 'add' ? password : '',
          currentPassword: mode === 'remove' ? currentPassword : undefined
        },
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      // Download the result PDF
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      const originalName = selectedFile.name.replace('.pdf', '');
      const suffix = mode === 'add' ? '-protected' : '-unprotected';
      a.download = `${originalName}${suffix}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        mode === 'add' 
          ? t('protectPdf.toast.addSuccess') 
          : t('protectPdf.toast.removeSuccess')
      );

      // Reset form
      setSelectedFile(null);
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setProgress(0);
    } catch (error: any) {
      console.error('Protection error:', error);
      toast.error(error.message || t('protectPdf.error.processFailed'));
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
            <CardTitle>{t('protectPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('protectPdf.loginDescription')}</CardDescription>
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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('protectPdf.title')}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{t('protectPdf.subtitle')}</p>
            </div>

            {/* Mode Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('protectPdf.mode.title')}</CardTitle>
                <CardDescription>{t('protectPdf.mode.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={handleModeChange}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('protectPdf.mode.add')}
                    </TabsTrigger>
                    <TabsTrigger value="remove" className="flex items-center gap-2">
                      <LockOpen className="h-4 w-4" />
                      {t('protectPdf.mode.remove')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t('protectPdf.upload.title')}
                </CardTitle>
                <CardDescription>{t('protectPdf.upload.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <DragAndDropFileZone
                  onFileDrop={handleFileDrop}
                  accept="application/pdf"
                  multiple={false}
                  dragOverlayTextSingle={t('protectPdf.dragOverlay')}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {mode === 'add' ? (
                        <Lock className="h-8 w-8 text-primary" />
                      ) : (
                        <LockOpen className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedFile ? selectedFile.name : t('protectPdf.upload.selectFile')}
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
                          <span>{t('protectPdf.upload.button')}</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </DragAndDropFileZone>
              </CardContent>
            </Card>

            {/* Password Section - Add Mode */}
            {selectedFile && mode === 'add' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t('protectPdf.password.addTitle')}</CardTitle>
                  <CardDescription>{t('protectPdf.password.addDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('protectPdf.password.label')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('protectPdf.password.placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">{t('protectPdf.password.help')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('protectPdf.password.confirmLabel')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t('protectPdf.password.confirmPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Section - Remove Mode */}
            {selectedFile && mode === 'remove' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t('protectPdf.password.removeTitle')}</CardTitle>
                  <CardDescription>{t('protectPdf.password.removeDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('protectPdf.password.currentLabel')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder={t('protectPdf.password.currentPlaceholder')}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">{t('protectPdf.password.currentHelp')}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Section */}
            {isProcessing && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {mode === 'add' 
                          ? t('protectPdf.progress.adding') 
                          : t('protectPdf.progress.removing')}
                      </span>
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
                  onClick={handleProcess}
                  disabled={isProcessing || !isFormValid()}
                  className="min-w-[200px]"
                >
                  {isProcessing ? (
                    <>
                      {mode === 'add' ? (
                        <Lock className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LockOpen className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {mode === 'add' 
                        ? t('protectPdf.protect.adding') 
                        : t('protectPdf.protect.removing')}
                    </>
                  ) : (
                    <>
                      {mode === 'add' ? (
                        <Lock className="mr-2 h-4 w-4" />
                      ) : (
                        <LockOpen className="mr-2 h-4 w-4" />
                      )}
                      {mode === 'add' 
                        ? t('protectPdf.protect.addButton') 
                        : t('protectPdf.protect.removeButton')}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <AdSenseSidebar />
        </div>
      </div>
    </div>
  );
}
