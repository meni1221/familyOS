import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';
import Footer from '../Footer';
import MobileNav from '../MobileNav';
import { SkipLink } from '../../accessibility';
import { useSeo } from '../../../hooks/useSeo';

/** Screen names, so the browser history and the tab title say where you are. */
const ROUTE_TITLES: Record<string, string> = {
  '/app': 'לוח בקרה',
  '/app/tasks': 'משימות',
  '/app/calendar': 'יומן',
  '/app/baby': 'התינוק',
  '/app/budget': 'תקציב',
  '/app/notifications': 'התראות',
  '/app/settings': 'הגדרות',
  '/app/profile': 'פרופיל',
};

/**
 * The header spans the whole viewport and the sidebar starts underneath it,
 * so the top bar reads as one continuous strip on every screen size.
 *
 * The app sits behind a login, so it keeps itself out of search indexes.
 */
const AppShell = () => {
  const { pathname } = useLocation();
  useSeo({ title: ROUTE_TITLES[pathname] ?? 'האזור האישי', noIndex: true });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SkipLink />
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-1 flex-col lg:ms-60">
          <main className="flex-1 p-4 pb-8 md:p-6 lg:p-8" id="main-content">
            <div className="mx-auto max-w-content">
              <Outlet />
            </div>
          </main>
          <Footer className="pb-24 lg:pb-8" />
          <MobileNav />
        </div>
      </div>
    </div>
  );
};

export default AppShell;
