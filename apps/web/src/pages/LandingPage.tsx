import { Link } from 'react-router-dom';
import {
  IconCheck,
  IconCalendar,
  IconBabyBottle,
  IconWallet,
  IconFile,
  IconBell,
  IconShield,
  IconHeart,
  IconUsers,
  IconSparkles,
} from '@tabler/icons-react';
import BrandLogo from '../components/ui/BrandLogo';

const features = [
  {
    icon: IconCheck,
    title: 'משימות משפחתיות',
    description: 'ניהול משימות משותף עם הקצאת אחריות, עדיפויות ותאריכי יעד',
  },
  {
    icon: IconCalendar,
    title: 'יומן משפחתי',
    description: 'סינורון אירועים, פגישות ומסגרות זמן לכל בני המשפחה',
  },
  {
    icon: IconBabyBottle,
    title: 'שגרת התינוק',
    description: 'מעקב הזנה, שינה וחיתולים עם סיכומים יומיים ושבועיים',
  },
  {
    icon: IconWallet,
    title: 'תקציב משפחתי',
    description: 'ניהול הוצאות והכנסות עם סיכומים לפי קטגוריות',
  },
  {
    icon: IconFile,
    title: 'כספת מסמכים',
    description: 'אחסון מאובטח של מסמכים חשובים עם תזכורות תפוגה',
  },
  {
    icon: IconBell,
    title: 'התראות חכמות',
    description: 'תזכורות בזמן על משימות, אירועים ומסמכים',
  },
];

const benefits = [
  {
    icon: IconHeart,
    title: 'פחות עומס מנטלי',
    description: 'כל המידע במקום אחד — לא צריך לזכור כלום',
  },
  {
    icon: IconUsers,
    title: 'שיתוף פעולה אמיתי',
    description: 'כל בני המשפחה רואים את אותה תמונה',
  },
  {
    icon: IconShield,
    title: 'פרטיות מלאה',
    description: 'הנתונים שלכם שייכים לכם — לנו רק מתשתמשים בהם',
  },
  {
    icon: IconSparkles,
    title: 'חוויה פרימיום',
    description: 'עיצוב שמרגיש כמו מוצר אמיתי, לא כמו כלי ניהול',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BrandLogo to="/" />
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-ink-secondary hover:text-ink">
              תכונות
            </a>
            <a href="#how-it-works" className="text-sm text-ink-secondary hover:text-ink">
              איך זה עובד
            </a>
            <a href="#security" className="text-sm text-ink-secondary hover:text-ink">
              אבטחה
            </a>
            <Link to="/privacy" className="text-sm text-ink-secondary hover:text-ink">
              פרטיות
            </Link>
            <Link to="/accessibility" className="text-sm text-ink-secondary hover:text-ink">
              נגישות
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost btn-sm">
              התחברות
            </Link>
            <Link to="/register" className="btn-primary btn-sm">
              הרשמה
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-content px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-ink md:text-5xl">
            כל מה שהמשפחה צריכה, במקום אחד
          </h1>
          <p className="mb-8 text-lg text-ink-secondary">
            פחות עומס מנטלי. יותר זמן למה שחשוב.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn-primary w-full sm:w-auto">
              התחילו בחינם
            </Link>
            <a href="#features" className="btn-secondary w-full sm:w-auto">
              גלושו בתכונות
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-content px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-ink">כל מה שהמשפחה שלכם צריכה</h2>
            <p className="text-ink-secondary">כלים פשוטים לניהול החיים המשפחתיים</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card">
                <div className="mb-4 inline-flex rounded-4 bg-sage-light p-3">
                  <feature.icon className="h-5 w-5 text-forest" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="mx-auto max-w-content px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-ink">איך זה עובד</h2>
            <p className="text-ink-secondary">שלושה שלבים פשוטים</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'צרו משפחה', description: 'הרשמו וצרו סביבת עבודה משפחתית' },
              { step: '2', title: 'זמנו בני משפחה', description: 'שלחו הזמנות לבני משפחה אחרים' },
              { step: '3', title: 'תחילו לתאם', description: 'צרו משימות, אירועים ותקציב משותף' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink">{item.title}</h3>
                <p className="text-sm text-ink-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-y border-border bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-content px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-ink">אבטחה ופרטיות</h2>
            <p className="text-ink-secondary">הנתונים שלכם שייכים לכם</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4 bg-sage-light">
                  <benefit.icon className="h-5 w-5 text-forest" />
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-ink">{benefit.title}</h3>
                  <p className="text-sm text-ink-secondary">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-content px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-ink">מוכנים להתחיל?</h2>
          <p className="mb-8 text-ink-secondary">
            הצטרפו למשפחות שמנהלות את חייהן בצורה חכמה יותר
          </p>
          <Link to="/register" className="btn-primary">
            צרו משפחה חינם
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-content px-4 text-center text-sm text-ink-secondary">
          <p className="mb-2">FamilyOS — כל מה שהמשפחה צריכה, במקום אחד</p>
          <div className="mb-3 flex items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-ink">מדיניות פרטיות</Link>
            <span className="text-border">|</span>
            <Link to="/accessibility" className="hover:text-ink">הצהרת נגישות</Link>
          </div>
          <p>
            נבנה על ידי{' '}
            <a
              href="https://levi-tec.menilevi0533011599.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-forest hover:underline"
            >
              levi-tec
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
