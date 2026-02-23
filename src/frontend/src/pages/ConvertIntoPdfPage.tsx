import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, Image } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../i18n/useI18n';
import AdSenseHeader from '../components/AdSenseHeader';
import AdSenseSidebar from '../components/AdSenseSidebar';

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
      <AdSenseHeader />
      
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
          <div>
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('convertIntoPdf.title')}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{t('convertIntoPdf.subtitle')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Word to PDF */}
              <Link to="/tools/word-to-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>{t('convertIntoPdf.wordToPdf.title')}</CardTitle>
                    <CardDescription>{t('convertIntoPdf.wordToPdf.description')}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Excel to PDF */}
              <Link to="/tools/excel-to-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>{t('convertIntoPdf.excelToPdf.title')}</CardTitle>
                    <CardDescription>{t('convertIntoPdf.excelToPdf.description')}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Image to PDF */}
              <Link to="/tools/image-to-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                      <Image className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>{t('convertIntoPdf.imageToPdf.title')}</CardTitle>
                    <CardDescription>{t('convertIntoPdf.imageToPdf.description')}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>

          <AdSenseSidebar />
        </div>
      </div>
    </div>
  );
}
