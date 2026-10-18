import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/seo';

interface SeoOptions {
  /** The page's own name, without the site suffix. */
  title: string;
  description?: string;
  /** App pages sit behind a login, so they are kept out of the index. */
  noIndex?: boolean;
  /** Canonical path, when it should differ from the current one. */
  path?: string;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = href;
}

/**
 * Keeps the document title, the description, the robots instruction and the
 * canonical URL in step with the page being shown.
 *
 * The values live in `index.html` for the landing page — the one copy a crawler
 * sees before any JavaScript runs — and this hook takes over from there.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, noIndex = false, path }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setCanonical(url);
  }, [title, description, noIndex, path]);
}
