import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { applyLocale, getStoredLocale, normalizeLocale } from './lib/locale';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import BabyPage from './pages/BabyPage';
import BudgetPage from './pages/BudgetPage';
import DocumentsPage from './pages/DocumentsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AccessibilityPage from './pages/AccessibilityPage';
import PrivacyPage from './pages/PrivacyPage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AccessibilityWidget, SkipLink } from './components/accessibility';
import { ContentGuard } from './components/security';
import { useRealtimeConnection } from './hooks/useRealtime';

/** Mounts the realtime socket once, for the lifetime of the app. */
function RealtimeBridge() {
  useRealtimeConnection();
  return null;
}

/**
 * Keeps `<html lang/dir>` and the formatter locale in sync with the language
 * saved on the account (falling back to the last choice made on this device).
 */
function LocaleSync() {
  const { user } = useAuth();

  useEffect(() => {
    applyLocale(user ? normalizeLocale(user.preferredLocale) : getStoredLocale());
  }, [user]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
}

function PublicRoute({ children }: { children: React.ReactNode }) {
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
}

export default function App() {
  return (
    <>
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
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="baby" element={<BabyPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Global, mounted once: available on every page, public or protected. */}
      <RealtimeBridge />
      <LocaleSync />
      <ContentGuard />
      <AccessibilityWidget />
    </>
  );
}
