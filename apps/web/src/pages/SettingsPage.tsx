import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  FamilySection,
  InvitationBanner,
  PasswordSection,
  PreferencesSection,
  ProfileSection,
} from '../components/settings';
import { useLogout } from '../hooks/useAuth';

export default function SettingsPage() {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">הגדרות</h1>
          <p className="text-sm text-ink-secondary">ניהול הפרופיל, המשפחה והאבטחה</p>
        </div>
      </div>

      <div className="space-y-4">
        <InvitationBanner />
        <ProfileSection />
        <PreferencesSection />
        <FamilySection />
        <PasswordSection />

        <div className="card flex flex-wrap items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-4 bg-red-50">
            <IconLogout className="h-5 w-5 text-error" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">התנתקות</p>
            <p className="text-xs text-ink-secondary">
              יציאה מהחשבון במכשיר הזה. תמיד אפשר להתחבר מחדש.
            </p>
          </div>
          <button type="button" className="btn-danger btn-sm" onClick={handleLogout}>
            <IconLogout className="h-4 w-4" />
            התנתקות
          </button>
        </div>
      </div>
    </div>
  );
}
