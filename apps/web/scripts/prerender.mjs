/**
 * Writes one HTML file per public page after Vite has built the app.
 *
 * A single-page app serves the same `index.html` for every route, so the title,
 * the description and the structured data a crawler reads are always the home
 * page's — unless the server hands it something else. This script takes the
 * built home page, rewrites the head for each public route, and writes
 * `dist/<path>/index.html`. Nginx's `try_files $uri $uri/ /index.html` already
 * picks that file up, so no server change is needed.
 *
 * Titles and descriptions come from `src/seo/content.json`, the same file the
 * React pages read, so the static copy and the rendered copy cannot drift.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(webRoot, 'dist');
const content = JSON.parse(readFileSync(join(webRoot, 'src/seo/content.json'), 'utf8'));

const site = content.siteUrl.replace(/\/$/, '');
const homeHtml = readFileSync(join(distDir, 'index.html'), 'utf8');

/*
 * The home page carries its FAQ twice — once as visible HTML rendered by
 * React, once as FAQPage data written by hand into `index.html`. Search
 * engines require the two to say the same thing, so a content change that
 * only touches one of them fails the build instead of shipping a mismatch.
 */
for (const item of content.faq) {
  if (!homeHtml.includes(item.question) || !homeHtml.includes(item.answer)) {
    throw new Error(
      `prerender: FAQ mismatch between src/seo/content.json and index.html: ${item.question}`
    );
  }
}

/** Text going into an attribute or a text node. */
const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const replaceOnce = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) {
    throw new Error(`prerender: could not find ${label} in dist/index.html`);
  }
  return html.replace(pattern, replacement);
};

const setMeta = (html, key, value) => {
  const pattern = new RegExp(`(<meta\\s+(?:name|property)="${key}"[^>]*content=")[^"]*(")`);
  return replaceOnce(html, pattern, `$1${escapeHtml(value)}$2`, `meta ${key}`);
};

const pageUrl = (path) => `${site}${path === '/' ? '/' : path}`;

const structuredData = (path, title, description) => {
  const url = pageUrl(path);
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${site}/#website` },
        inLanguage: 'he-IL',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'דף הבית', item: `${site}/` },
          { '@type': 'ListItem', position: 2, name: title, item: url },
        ],
      },
    ],
  };

  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n    </script>`;
};

const noscriptFor = (title, description) =>
  `<noscript>\n      <div dir="rtl">\n        <h1>${escapeHtml(title)}</h1>\n        <p>${escapeHtml(description)}</p>\n        <p><a href="/">חזרה לדף הבית של שלנו</a></p>\n      </div>\n    </noscript>`;

for (const [path, page] of Object.entries(content.pages)) {
  // The home page is already the built `index.html`; only the deeper routes
  // need a copy of it.
  if (path === '/') continue;

  const fullTitle = `${page.title} · שלנו`;
  const url = pageUrl(path);

  let html = homeHtml;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`, 'title');
  html = setMeta(html, 'description', page.description);
  html = setMeta(html, 'og:title', fullTitle);
  html = setMeta(html, 'og:description', page.description);
  html = setMeta(html, 'og:url', url);
  html = setMeta(html, 'twitter:title', fullTitle);
  html = setMeta(html, 'twitter:description', page.description);

  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
    'canonical'
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="he-IL" href="[^"]*"\s*\/>/,
    `<link rel="alternate" hreflang="he-IL" href="${url}" />`,
    'hreflang he-IL'
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    'hreflang x-default'
  );

  html = replaceOnce(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    structuredData(path, page.title, page.description),
    'structured data'
  );
  html = replaceOnce(
    html,
    /<noscript>[\s\S]*?<\/noscript>/,
    noscriptFor(page.title, page.description),
    'noscript fallback'
  );

  const directory = join(distDir, path.replace(/^\//, ''));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), html, 'utf8');

  console.log(`prerender: ${path} -> ${join(directory, 'index.html')}`);
}
