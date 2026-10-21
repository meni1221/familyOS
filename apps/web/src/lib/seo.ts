import seoContent from '../seo/content.json';

/**
 * One place for the facts search engines are told about the site, so a change
 * of domain or wording does not have to be hunted down in four files.
 *
 * Public page titles and descriptions live in `../seo/content.json`, which the
 * build-time prerenderer reads too: the static HTML a crawler gets first and
 * the page React renders afterwards say the same thing. `robots.txt` and
 * `sitemap.xml` are static files — update them together with this file.
 */
export const SITE_URL = seoContent.siteUrl;

export const SITE_NAME = 'שלנו';

export const SITE_TAGLINE = seoContent.pages['/'].title;

export const DEFAULT_DESCRIPTION = seoContent.pages['/'].description;

export const OG_IMAGE = `${SITE_URL}/og.png`;

export const OG_IMAGE_ALT = 'שלנו — אפליקציה לניהול חיי המשפחה';

export type PublicPath = keyof typeof seoContent.pages;

export interface PublicPageSeo {
  title: string;
  description: string;
}

export const publicPageSeo = (path: PublicPath): PublicPageSeo => seoContent.pages[path];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = seoContent.faq;

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
