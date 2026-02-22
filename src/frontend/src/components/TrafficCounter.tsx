import { useGetTrafficCounter } from '../hooks/useQueries';
import { Eye } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

export default function TrafficCounter() {
  const { data: totalViews, isLoading } = useGetTrafficCounter();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>...</span>
      </div>
    );
  }

  const formattedViews = totalViews ? Number(totalViews).toLocaleString() : '0';

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span className="hidden sm:inline">{formattedViews}</span>
      <span className="hidden md:inline">{t('traffic.views')}</span>
    </div>
  );
}
