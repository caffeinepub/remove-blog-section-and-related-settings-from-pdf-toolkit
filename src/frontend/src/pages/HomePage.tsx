import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Layers, Minimize2, Lock, RefreshCw, RotateCw } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { Link } from '@tanstack/react-router';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              {t('home.hero.title')}{' '}
              <span className="text-primary">{t('home.hero.titleHighlight')}</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            {isAuthenticated ? (
              <Link to="/my-files">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                  {t('home.hero.getStarted')}
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" disabled>
                {t('home.hero.loginRequired')}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                {t('home.tools.title')}
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.tools.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Link to="/tools/merge-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.merge')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.mergeDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/tools/split-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 md:mb-4">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.split')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.splitDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/tools/compress-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3 md:mb-4">
                      <Minimize2 className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.compress')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.compressDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/tools/protect-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-3 md:mb-4">
                      <Lock className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.protect')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.protectDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/tools/rotate-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                      <RotateCw className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.rotate')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.rotateDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/tools/convert-into-pdf">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 md:mb-4">
                      <RefreshCw className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{t('home.tools.convertIntoPdf')}</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {t('home.tools.convertIntoPdfDesc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{t('home.features.easyTitle')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{t('home.features.easyDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{t('home.features.secureTitle')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{t('home.features.secureDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{t('home.features.powerfulTitle')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{t('home.features.powerfulDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8">
              {t('home.cta.subtitle')}
            </p>
            {isAuthenticated ? (
              <Link to="/my-files">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                  {t('home.cta.button')}
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" disabled>
                {t('home.cta.loginRequired')}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
