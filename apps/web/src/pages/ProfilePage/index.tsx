import { AccountSection, PasswordSection, ProfileSection } from '../../components/settings';

/**
 * The account view reached from the avatar menu: who you are plus the
 * credentials to keep it that way. Family and app preferences stay in settings.
 */
const ProfilePage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">הפרופיל שלי</h1>
          <p className="text-sm text-ink-secondary">הפרטים האישיים והסיסמה של החשבון</p>
        </div>
      </div>

      <div className="space-y-4">
        <ProfileSection />
        <PasswordSection />
        <AccountSection />
      </div>
    </div>
  );
};

export default ProfilePage;
