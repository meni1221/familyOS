import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import SkipLink from '../accessibility/SkipLink';

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <SkipLink />
      <Sidebar />
      <div className="flex flex-1 flex-col md:ms-60">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8" id="main-content">
          <div className="mx-auto max-w-content">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
