import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="container px-4 py-16 md:py-24">
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-muted-foreground">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">{t('notFound.title')}</h2>
          <p className="text-muted-foreground">{t('notFound.description')}</p>
        </div>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            {t('notFound.goHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
