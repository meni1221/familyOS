import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { applyLocale, getStoredLocale, normalizeLocale } from './lib/locale';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AppShell from './components/layout/AppShell';
import AccessibilityPage from './pages/AccessibilityPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PageTransition from './components/layout/PageTransition';
import ToastProvider from './components/ui/ToastProvider';
import ConfirmProvider from './components/ui/ConfirmProvider';
import CookieNotice from './components/ui/CookieNotice';
import { AccessibilityWidget, SkipLink } from './components/accessibility';
import { ContentGuard } from './components/security';
import { useRealtimeConnection } from './hooks/useRealtime';
import type { ReactNode } from 'react';

/*
 * The signed-in screens are loaded on demand: a visitor reading the landing
 * page should not download the task board, the calendar and the budget chart
 * before deciding to sign up.
 */
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const BabyPage = lazy(() => import('./pages/BabyPage'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const PageFallback = () => (
  <div className="flex justify-center py-16">
    <LoadingSpinner size="lg" />
  </div>
);

const withSuspense = (page: ReactNode) => (
  <Suspense fallback={<PageFallback />}>{page}</Suspense>
);

/** Mounts the realtime socket once, for the lifetime of the app. */
const RealtimeBridge = () => {
  useRealtimeConnection();
  return null;
};

/**
 * Keeps `<html lang/dir>` and the formatter locale in sync with the language
 * saved on the account (falling back to the last choice made on this device).
 */
const LocaleSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    applyLocale(user ? normalizeLocale(user.preferredLocale) : getStoredLocale());
  }, [user]);

  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <PageTransition>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <>
                      <SkipLink />
                      <LandingPage />
                    </>
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={withSuspense(<DashboardPage />)} />
                <Route path="tasks" element={withSuspense(<TasksPage />)} />
                <Route path="calendar" element={withSuspense(<CalendarPage />)} />
                <Route path="baby" element={withSuspense(<BabyPage />)} />
                <Route path="budget" element={withSuspense(<BudgetPage />)} />
                <Route path="notifications" element={withSuspense(<NotificationsPage />)} />
                <Route path="settings" element={withSuspense(<SettingsPage />)} />
                <Route path="profile" element={withSuspense(<ProfilePage />)} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </ConfirmProvider>

        {/* Global, mounted once: available on every page, public or protected. */}
        <RealtimeBridge />
        <LocaleSync />
        <ContentGuard />
        <CookieNotice />
        <AccessibilityWidget />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
