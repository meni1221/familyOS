/**
 * One place for the facts search engines are told about the site, so a
 * change of domain or wording does not have to be hunted down in four files.
 *
 * `SITE_URL` is the public address the site is served from. It is also written
 * into `public/robots.txt` and `public/sitemap.xml`, which are static files —
 * update all three together.
 */
export const SITE_URL = 'https://shlanu.app';

export const SITE_NAME = 'שלנו';

export const SITE_TAGLINE = 'כל מה שהמשפחה צריכה, במקום אחד';

export const DEFAULT_DESCRIPTION =
  'שלנו היא אפליקציה לניהול חיי המשפחה: משימות משותפות, לוח שנה משפחתי, מעקב אחר תינוקות, תקציב הבית והתראות — במקום אחד, בעברית ובחינם.';

/** Words a family would actually type, not a list of every synonym. */
export const SITE_KEYWORDS = [
  'ניהול משפחה',
  'אפליקציה למשפחה',
  'משימות משפחתיות',
  'לוח שנה משפחתי',
  'מעקב תינוק',
  'יומן האכלות',
  'תקציב משפחתי',
  'הוצאות הבית',
  'ארגון המשפחה',
  'אפליקציה בעברית',
  'family management app',
  'family organizer',
  'shlanu',
].join(', ');
