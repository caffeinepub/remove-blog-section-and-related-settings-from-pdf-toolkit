import { Heart } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'pdf-vaulty'
  );

  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ad Space 1 */}
          <div className="flex items-center justify-center bg-muted/50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20">
            <span className="text-sm text-muted-foreground">{t('footer.adSpace')} 1</span>
          </div>

          {/* Ad Space 2 */}
          <div className="flex items-center justify-center bg-muted/50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20">
            <span className="text-sm text-muted-foreground">{t('footer.adSpace')} 2</span>
          </div>

          {/* Ad Space 3 */}
          <div className="flex items-center justify-center bg-muted/50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20">
            <span className="text-sm text-muted-foreground">{t('footer.adSpace')} 3</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {currentYear}. {t('footer.builtWith')}{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> {t('footer.using')}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
