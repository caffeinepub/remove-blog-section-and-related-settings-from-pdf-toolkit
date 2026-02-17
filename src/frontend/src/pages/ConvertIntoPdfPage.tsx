import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, Image, RefreshCw } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { Link } from '@tanstack/react-router';

export default function ConvertIntoPdfPage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t('convertIntoPdf.loginRequired')}</CardTitle>
            <CardDescription>{t('convertIntoPdf.loginDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('convertIntoPdf.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('convertIntoPdf.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link to="/tools/word-to-pdf">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-xl">{t('convertIntoPdf.wordToPdf')}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t('convertIntoPdf.wordToPdfDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/tools/excel-to-pdf">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 md:mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg md:text-xl">{t('convertIntoPdf.excelToPdf')}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t('convertIntoPdf.excelToPdfDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/tools/image-to-pdf">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3 md:mb-4">
                  <Image className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg md:text-xl">{t('convertIntoPdf.imageToPdf')}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t('convertIntoPdf.imageToPdfDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              {t('convertIntoPdf.howItWorks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('convertIntoPdf.step1')}</li>
              <li>{t('convertIntoPdf.step2')}</li>
              <li>{t('convertIntoPdf.step3')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
