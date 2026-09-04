/* ================================================================
   scripts/templates/sitemap-xml.mjs — public/sitemap.xml.

   The URL set is derived (config x locales x mirrors.enabled); the
   <lastmod> dates are passed in, because they are the one thing about
   this file that can't be recomputed from source. See the long note on
   lastmod in scripts/build.mjs for why.
   ================================================================ */

import { escapeHtml } from "../lib/html.mjs";
import { locales, isDefaultLocale, siteUrl, mirrorUrl } from "../lib/site-urls.mjs";

/**
 * Per-locale alternates for a mirror page, matching the rule the live
 * pages' <head> uses: the default locale points at the live page, every
 * other locale at that locale's mirror. No x-default — a sitemap's
 * alternate set is a plain equivalence group, and the pages themselves
 * already declare one.
 */
function alternates(file) {
  return locales.map((l) => {
    const href = isDefaultLocale(l.code) ? siteUrl(file) : mirrorUrl(l.code, file);
    return `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${href}"/>`;
  });
}

/**
 * @param {Array<{url:string, lastmod:string, image?:{loc:string,title:string}, alternateFile?:string}>} entries
 */
export function renderSitemapXml(entries) {
  const usesXhtml = entries.some((e) => e.alternateFile !== undefined);
  const usesImage = entries.some((e) => e.image);

  const lines = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`);
  if (usesXhtml) lines.push(`        xmlns:xhtml="http://www.w3.org/1999/xhtml"`);
  if (usesImage) lines.push(`        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`);
  lines[lines.length - 1] += ">";

  for (const e of entries) {
    lines.push(`  <url>`);
    lines.push(`    <loc>${e.url}</loc>`);
    lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.image) {
      lines.push(`    <image:image>`);
      lines.push(`      <image:loc>${e.image.loc}</image:loc>`);
      lines.push(`      <image:title>${escapeHtml(e.image.title)}</image:title>`);
      lines.push(`    </image:image>`);
    }
    if (e.alternateFile !== undefined) lines.push(...alternates(e.alternateFile));
    lines.push(`  </url>`);
  }

  lines.push(`</urlset>`);
  return lines.join("\n") + "\n";
}
