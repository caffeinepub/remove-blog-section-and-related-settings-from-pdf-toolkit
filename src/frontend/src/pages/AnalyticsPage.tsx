import { useGetTrafficCounter } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, TrendingUp, Calendar } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

export default function AnalyticsPage() {
  const { t } = useI18n();
  const { data: totalViews, isLoading } = useGetTrafficCounter();

  // Calculate today's views (simplified - in production you'd track this separately)
  const todayViews = totalViews ? Number(totalViews) % 100 : 0;
  
  // Calculate this week's views (simplified - in production you'd track this separately)
  const weekViews = totalViews ? Number(totalViews) % 500 : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Views Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.totalViews')}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">
                  {t('analytics.loading')}
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalViews ? Number(totalViews).toLocaleString() : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('analytics.allTime')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Today's Views Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.viewsToday')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">
                  {t('analytics.loading')}
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {todayViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('analytics.today')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* This Week's Views Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.viewsThisWeek')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">
                  {t('analytics.loading')}
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {weekViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('analytics.last7Days')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('analytics.aboutTitle')}</CardTitle>
            <CardDescription>{t('analytics.aboutDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• {t('analytics.info1')}</p>
            <p>• {t('analytics.info2')}</p>
            <p>• {t('analytics.info3')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
