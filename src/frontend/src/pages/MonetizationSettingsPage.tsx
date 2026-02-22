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
import { AdSenseConfig } from '../backend';

export default function MonetizationSettingsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: config, isLoading: configLoading } = useGetAdSenseConfig();
  const updateConfig = useUpdateAdSenseConfig();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [publisherId, setPublisherId] = useState('');
  const [headerAdUnitId, setHeaderAdUnitId] = useState('');
  const [sidebarAdUnitId, setSidebarAdUnitId] = useState('');
  const [footerAdUnitId, setFooterAdUnitId] = useState('');
  const [inContentAdUnitId, setInContentAdUnitId] = useState('');
  const [enableHeaderBanner, setEnableHeaderBanner] = useState(true);
  const [enableSidebarAds, setEnableSidebarAds] = useState(true);
  const [enableFooterBanner, setEnableFooterBanner] = useState(true);
  const [enableInContentAds, setEnableInContentAds] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (config) {
      setPublisherId(config.publisherId);
      setHeaderAdUnitId(config.headerAdUnitId);
      setSidebarAdUnitId(config.sidebarAdUnitId);
      setFooterAdUnitId(config.footerAdUnitId);
      setInContentAdUnitId(config.inContentAdUnitId);
      setEnableHeaderBanner(config.enableHeaderBanner);
      setEnableSidebarAds(config.enableSidebarAds);
      setEnableFooterBanner(config.enableFooterBanner);
      setEnableInContentAds(config.enableInContentAds);
      setHasUnsavedChanges(false);
    }
  }, [config]);

  const validatePublisherId = (id: string): boolean => {
    if (!id) return true; // Empty is valid (not configured yet)
    const pattern = /^ca-pub-\d{16}$/;
    return pattern.test(id);
  };

  // Auto-save when toggles change
  const handleToggleChange = async (field: keyof AdSenseConfig, value: boolean) => {
    const newConfig: AdSenseConfig = {
      publisherId,
      headerAdUnitId,
      sidebarAdUnitId,
      footerAdUnitId,
      inContentAdUnitId,
      enableHeaderBanner,
      enableSidebarAds,
      enableFooterBanner,
      enableInContentAds,
      [field]: value,
    };

    // Update local state immediately
    switch (field) {
      case 'enableHeaderBanner':
        setEnableHeaderBanner(value);
        break;
      case 'enableSidebarAds':
        setEnableSidebarAds(value);
        break;
      case 'enableFooterBanner':
        setEnableFooterBanner(value);
        break;
      case 'enableInContentAds':
        setEnableInContentAds(value);
        break;
    }

    // Save to backend
    await updateConfig.mutateAsync(newConfig);
  };

  const handleSaveConfig = async () => {
    // Validate publisher ID format
    if (publisherId && !validatePublisherId(publisherId)) {
      setValidationError(t('monetization.adSenseValidationError'));
      return;
    }

    setValidationError('');

    const newConfig: AdSenseConfig = {
      publisherId,
      headerAdUnitId,
      sidebarAdUnitId,
      footerAdUnitId,
      inContentAdUnitId,
      enableHeaderBanner,
      enableSidebarAds,
      enableFooterBanner,
      enableInContentAds,
    };

    await updateConfig.mutateAsync(newConfig);
    setHasUnsavedChanges(false);
  };

  const handleFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setHasUnsavedChanges(true);
    setValidationError('');
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
              <span>{t('monetization.tabs.configuration')}</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{t('monetization.tabs.preview')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            {/* AdSense Configuration Card */}
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
                  <Label htmlFor="publisherId">{t('monetization.publisherIdLabel')}</Label>
                  <Input
                    id="publisherId"
                    value={publisherId}
                    onChange={(e) => handleFieldChange(setPublisherId, e.target.value)}
                    placeholder={t('monetization.publisherIdPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('monetization.publisherIdHelp')}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="headerAdUnitId">{t('monetization.headerAdUnitLabel')}</Label>
                  <Input
                    id="headerAdUnitId"
                    value={headerAdUnitId}
                    onChange={(e) => handleFieldChange(setHeaderAdUnitId, e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sidebarAdUnitId">{t('monetization.sidebarAdUnitLabel')}</Label>
                  <Input
                    id="sidebarAdUnitId"
                    value={sidebarAdUnitId}
                    onChange={(e) => handleFieldChange(setSidebarAdUnitId, e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerAdUnitId">{t('monetization.footerAdUnitLabel')}</Label>
                  <Input
                    id="footerAdUnitId"
                    value={footerAdUnitId}
                    onChange={(e) => handleFieldChange(setFooterAdUnitId, e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inContentAdUnitId">{t('monetization.inContentAdUnitLabel')}</Label>
                  <Input
                    id="inContentAdUnitId"
                    value={inContentAdUnitId}
                    onChange={(e) => handleFieldChange(setInContentAdUnitId, e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                {validationError && (
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {hasUnsavedChanges && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('monetization.config.unsavedChanges')}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSaveConfig}
                  disabled={updateConfig.isPending || !hasUnsavedChanges}
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

                {updateConfig.isSuccess && !hasUnsavedChanges && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>{t('monetization.adSenseUpdateSuccess')}</AlertTitle>
                  </Alert>
                )}
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

                {/* Sidebar Ads */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">
                      {t('monetization.placements.sidebarAds')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('monetization.placements.sidebarAdsDesc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enableSidebarAds ? 'default' : 'secondary'}>
                      {enableSidebarAds ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </Badge>
                    <Switch
                      checked={enableSidebarAds}
                      onCheckedChange={(checked) => handleToggleChange('enableSidebarAds', checked)}
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

                <Separator />

                {/* In-Content Ads */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-base font-medium">
                      In-Content Ads
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show ads within content sections
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enableInContentAds ? 'default' : 'secondary'}>
                      {enableInContentAds ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
                    </Badge>
                    <Switch
                      checked={enableInContentAds}
                      onCheckedChange={(checked) => handleToggleChange('enableInContentAds', checked)}
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

                {/* Sidebar Ad Preview */}
                <div className={cn('space-y-2', !enableSidebarAds && 'opacity-50')}>
                  <Label className="text-sm font-medium">Sidebar Ad</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      {enableSidebarAds ? t('monetization.placements.enabled') : t('monetization.placements.disabled')}
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
