import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, SITE_URL } from '../lib/seo';

interface SeoOptions {
  /** The page's own name, without the site suffix. */
  title: string;
  description?: string;
  /** App pages sit behind a login, so they are kept out of the index. */
  noIndex?: boolean;
  /** Canonical path, when it should differ from the current one. */
  path?: string;
}

const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
  const selector = extra
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`;
  let link = document.head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    Object.entries(extra ?? {}).forEach(([name, value]) => link?.setAttribute(name, value));
    document.head.appendChild(link);
  }

  link.href = href;
};

/**
 * Keeps the document title, the description, the robots instruction, the
 * canonical URL and the social-sharing tags in step with the page being shown.
 *
 * The values also live in the prerendered HTML for each public page — the copy
 * a crawler sees before any JavaScript runs — and this hook takes over from
 * there.
 */
export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
  path,
}: SeoOptions) => {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', OG_IMAGE);
    setMeta('property', 'og:image:alt', OG_IMAGE_ALT);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', OG_IMAGE);
    setMeta('name', 'twitter:image:alt', OG_IMAGE_ALT);

    setLink('canonical', url);
    setLink('alternate', url, { hreflang: 'he-IL' });
    setLink('alternate', url, { hreflang: 'x-default' });
  }, [title, description, noIndex, path]);
};
