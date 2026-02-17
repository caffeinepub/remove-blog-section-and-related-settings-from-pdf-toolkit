import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from './i18n/I18nProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MyFilesPage from './pages/MyFilesPage';
import MonetizationSettingsPage from './pages/MonetizationSettingsPage';
import ExcelToPdfPage from './pages/ExcelToPdfPage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import MergePdfPage from './pages/MergePdfPage';
import CompressPdfPage from './pages/CompressPdfPage';
import SplitPdfPage from './pages/SplitPdfPage';
import ProtectPdfPage from './pages/ProtectPdfPage';
import RotatePdfPage from './pages/RotatePdfPage';
import WordToPdfPage from './pages/WordToPdfPage';
import ConvertIntoPdfPage from './pages/ConvertIntoPdfPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const myFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-files',
  component: MyFilesPage,
});

const monetizationSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/monetization',
  component: MonetizationSettingsPage,
});

const excelToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/excel-to-pdf',
  component: ExcelToPdfPage,
});

const imageToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/image-to-pdf',
  component: ImageToPdfPage,
});

const mergePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/merge-pdf',
  component: MergePdfPage,
});

const compressPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/compress-pdf',
  component: CompressPdfPage,
});

const splitPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/split-pdf',
  component: SplitPdfPage,
});

const protectPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/protect-pdf',
  component: ProtectPdfPage,
});

const rotatePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/rotate-pdf',
  component: RotatePdfPage,
});

const wordToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/word-to-pdf',
  component: WordToPdfPage,
});

const convertIntoPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/convert-into-pdf',
  component: ConvertIntoPdfPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  myFilesRoute,
  monetizationSettingsRoute,
  excelToPdfRoute,
  imageToPdfRoute,
  mergePdfRoute,
  compressPdfRoute,
  splitPdfRoute,
  protectPdfRoute,
  rotatePdfRoute,
  wordToPdfRoute,
  convertIntoPdfRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isActorReady = !!actor && !actorFetching;
  
  // Only show profile setup when:
  // 1. Internet Identity initialization is complete (!isInitializing)
  // 2. User is authenticated (isAuthenticated)
  // 3. Actor is ready (isActorReady)
  // 4. Profile query has completed (!profileLoading && isFetched)
  // 5. User has no profile (userProfile === null)
  const showProfileSetup = 
    !isInitializing && 
    isAuthenticated && 
    isActorReady && 
    !profileLoading && 
    isFetched && 
    userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <RouterProvider router={router} />
        <Toaster />
        {showProfileSetup && <ProfileSetupDialog />}
      </I18nProvider>
    </ThemeProvider>
  );
}
