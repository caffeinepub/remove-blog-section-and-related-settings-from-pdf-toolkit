import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '../i18n/useI18n';
import { languages } from '../i18n/translations';

interface LanguageSelectorProps {
  mobile?: boolean;
}

export default function LanguageSelector({ mobile = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useI18n();

  if (mobile) {
    // Mobile version - simple buttons
    return (
      <div className="space-y-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setLanguage(lang.code as 'en' | 'es')}
          >
            <Globe className="mr-2 h-4 w-4" />
            {lang.name}
          </Button>
        ))}
      </div>
    );
  }

  // Desktop version - dropdown
  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('language.label')} className="h-9 w-9">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'es')}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
