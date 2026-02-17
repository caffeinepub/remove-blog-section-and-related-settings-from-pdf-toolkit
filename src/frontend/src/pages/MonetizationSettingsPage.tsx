import { useState, useEffect } from 'react';
import { useGetAdSenseConfig, useUpdateAdSenseConfig, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Info, Save, Shield, Eye, Settings, CheckCircle2, Layout } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useI18n } from '../i18n/useI18n';

export default function MonetizationSettingsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: config, isLoading: configLoading } = useGetAdSenseConfig();
  const updateConfig = useUpdateAdSenseConfig();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [publisherId, setPublisherId] = useState('');
  const [enableHeaderBanner, setEnableHeaderBanner] = useState(true);
  const [enableToolSectionAds, setEnableToolSectionAds] = useState(true);
  const [enableFooterBanner, setEnableFooterBanner] = useState(true);
  const [hasUnsavedPublisherId, setHasUnsavedPublisherId] = useState(false);

  useEffect(() => {
    if (config) {
      setPublisherId(config.publisherId);
      setEnableHeaderBanner(config.enableHeaderBanner);
      setEnableToolSectionAds(config.enableToolSectionAds);
      setEnableFooterBanner(config.enableFooterBanner);
      setHasUnsavedPublisherId(false);
    }
  }, [config]);

  // Auto-save when toggles change
  const handleToggleChange = async (field: string, value: boolean) => {
    const newConfig = {
      publisherId,
      enableHeaderBanner,
      enableToolSectionAds,
      enableFooterBanner,
      [field]: value,
    };

    // Update local state immediately
    switch (field) {
      case 'enableHeaderBanner':
        setEnableHeaderBanner(value);
        break;
      case 'enableToolSectionAds':
        setEnableToolSectionAds(value);
        break;
      case 'enableFooterBanner':
        setEnableFooterBanner(value);
        break;
    }

    // Save to backend
    await updateConfig.mutateAsync(newConfig);
  };

  const handleSavePublisherId = async () => {
    await updateConfig.mutateAsync({
      publisherId,
      enableHeaderBanner,
      enableToolSectionAds,
      enableFooterBanner,
    });
    setHasUnsavedPublisherId(false);
  };

  if (adminLoading || configLoading) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('monetization.accessDenied')}</CardTitle>
            </div>
            <CardDescription>{t('monetization.accessDeniedDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })}>{t('monetization.goHome')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">{t('monetization.title')}</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('monetization.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('monetization.tabs.configuration')}</span>
              <span className="sm:hidden">{t('monetization.tabs.configuration')}</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{t('monetization.tabs.preview')}</span>
              <span className="sm:hidden">{t('monetization.tabs.preview')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            {/* Publisher ID Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('monetization.config.title')}
                </CardTitle>
                <CardDescription>
                  {t('monetization.config.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publisherId">{t('monetization.config.publisherId')}</Label>
                  <Input
                    id="publisherId"
                    value={publisherId}
                    onChange={(e) => {
                      setPublisherId(e.target.value);
                      setHasUnsavedPublisherId(true);
                    }}
                    placeholder={t('monetization.config.publisherIdPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('monetization.config.publisherIdHelp')}
                  </p>
                </div>

                {hasUnsavedPublisherId && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('monetization.config.unsavedChanges')}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSavePublisherId}
                  disabled={updateConfig.isPending || !hasUnsavedPublisherId}
                  className="w-full sm:w-auto"
                >
                  {updateConfig.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('monetization.config.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('monetization.config.save')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Ad Placements Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  {t('monetization.placements.title')}
                </CardTitle>
                <CardDescription>
                  {t('monetization.placements.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Banner */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">
                      {t('monetization.placements.headerBanner')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('monetization.placements.headerBannerDesc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enableHeaderBanner ? 'default' : 'secondary'}>
                      {enableHeaderBanner ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </Badge>
                    <Switch
                      checked={enableHeaderBanner}
                      onCheckedChange={(checked) => handleToggleChange('enableHeaderBanner', checked)}
                      disabled={updateConfig.isPending}
                    />
                  </div>
                </div>

                <Separator />

                {/* Tool Section Ads */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">
                      {t('monetization.placements.toolSection')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('monetization.placements.toolSectionDesc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enableToolSectionAds ? 'default' : 'secondary'}>
                      {enableToolSectionAds ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </Badge>
                    <Switch
                      checked={enableToolSectionAds}
                      onCheckedChange={(checked) => handleToggleChange('enableToolSectionAds', checked)}
                      disabled={updateConfig.isPending}
                    />
                  </div>
                </div>

                <Separator />

                {/* Footer Banner */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">
                      {t('monetization.placements.footerBanner')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('monetization.placements.footerBannerDesc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enableFooterBanner ? 'default' : 'secondary'}>
                      {enableFooterBanner ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </Badge>
                    <Switch
                      checked={enableFooterBanner}
                      onCheckedChange={(checked) => handleToggleChange('enableFooterBanner', checked)}
                      disabled={updateConfig.isPending}
                    />
                  </div>
                </div>

                {updateConfig.isSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>{t('monetization.placements.autoSaved')}</AlertTitle>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {t('monetization.preview.title')}
                </CardTitle>
                <CardDescription>
                  {t('monetization.preview.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>{t('monetization.preview.instructions')}</AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    <p>{t('monetization.preview.step1')}</p>
                    <p>{t('monetization.preview.step2')}</p>
                    <p>{t('monetization.preview.step3')}</p>
                    <p>{t('monetization.preview.step4')}</p>
                  </AlertDescription>
                </Alert>

                {/* Header Banner Preview */}
                <div className={cn('space-y-2', !enableHeaderBanner && 'opacity-50')}>
                  <Label className="text-sm font-medium">{t('monetization.preview.headerBanner')}</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      {enableHeaderBanner ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </p>
                  </div>
                </div>

                {/* Tool Section Ad Preview */}
                <div className={cn('space-y-2', !enableToolSectionAds && 'opacity-50')}>
                  <Label className="text-sm font-medium">{t('monetization.preview.toolSection')}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      {enableToolSectionAds ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </p>
                  </div>
                </div>

                {/* Footer Banner Preview */}
                <div className={cn('space-y-2', !enableFooterBanner && 'opacity-50')}>
                  <Label className="text-sm font-medium">{t('monetization.preview.footerBanner')}</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      {enableFooterBanner ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
