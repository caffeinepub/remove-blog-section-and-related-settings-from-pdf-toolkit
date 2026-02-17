import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, Home, Upload, DollarSign } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../i18n/useI18n';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { t } = useI18n();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClass = mobile
      ? 'flex items-center gap-2 px-4 py-3 text-base hover:bg-accent rounded-md transition-colors'
      : 'text-sm font-medium hover:text-primary transition-colors';

    const handleClick = () => {
      if (mobile) setSheetOpen(false);
    };

    return (
      <>
        <Link to="/" className={linkClass} onClick={handleClick}>
          {mobile && <Home className="h-5 w-5" />}
          {t('nav.home')}
        </Link>
        {isAuthenticated && (
          <Link to="/my-files" className={linkClass} onClick={handleClick}>
            {mobile && <Upload className="h-5 w-5" />}
            {t('nav.myFiles')}
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/monetization" className={linkClass} onClick={handleClick}>
            {mobile && <DollarSign className="h-5 w-5" />}
            {t('nav.monetization')}
          </Link>
        )}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/generated/pdf-toolkit-logo-transparent.dim_200x200.png"
              alt="PDF Vaulty"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              PDF Vaulty
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && userProfile && (
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {userProfile.name}
            </span>
          )}
          <div className="hidden md:flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {isLoggingIn ? t('auth.loggingIn') : isAuthenticated ? t('auth.logout') : t('auth.login')}
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                <NavLinks mobile />
                <div className="mt-4 border-t pt-4 space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm text-muted-foreground mb-2">{t('language.label')}</p>
                    <LanguageSelector mobile />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 border-t">
                    <span className="text-sm text-muted-foreground">{t('nav.theme')}</span>
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
