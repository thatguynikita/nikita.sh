/* ================================================================
   scripts/templates/head.mjs — the <head> metadata block shared by
   index.html, cv.html and 404.html.

   Covers title/description/theme-color, canonical, hreflang, Open
   Graph, Twitter card, icons and the manifest link. Everything with a
   URL in it derives from site.config.mjs via site-urls.mjs, so a fork
   changes the domain in one place; the text comes from PAGES in
   content/site-data.mjs.
   ================================================================ */

import { SITE } from "../../site.config.mjs";
import { PAGES } from "../../content/site-data.mjs";
import { escapeHtml } from "../lib/html.mjs";
import { siteUrl, rootPath, mirrorUrl, locales, defaultLocale, isDefaultLocale } from "../lib/site-urls.mjs";

// Icons are the same on every page. Sizes match the files actually in
// public/assets/icons/.
const ICONS = [
  { rel: "apple-touch-icon", sizes: "180x180", file: "assets/icons/apple-touch-icon.png", type: null },
  { rel: "icon", sizes: "120x120", file: "assets/icons/favicon-120x120.png", type: "image/png" },
  { rel: "icon", sizes: "32x32", file: "assets/icons/favicon-32x32.png", type: "image/png" },
  { rel: "icon", sizes: "16x16", file: "assets/icons/favicon-16x16.png", type: "image/png" },
];

/**
 * hreflang set for a live page: the default locale points at the live
 * page itself, every other locale at that locale's crawler mirror
 * (the live site switches language client-side on the same URL, so the
 * mirror is the only distinct per-language URL that exists).
 *
 * Emitted only when there's actually a choice to describe — a
 * single-locale site, or one with mirrors switched off, has no
 * alternates and a self-referencing x-default would just be noise.
 */
function alternateLinks(pagePath, mirrorFile) {
  if (!SITE.mirrors.enabled || locales.length < 2) return [];
  const lines = locales.map((l) => {
    const href = isDefaultLocale(l.code) ? siteUrl(pagePath) : mirrorUrl(l.code, mirrorFile);
    return `<link rel="alternate" hreflang="${l.code}" href="${href}">`;
  });
  lines.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl(pagePath)}">`);
  return lines;
}

/**
 * @param {string} pageKey   key into PAGES ("index" | "cv" | "notFound")
 * @param {object} opts
 * @param {string} [opts.pagePath]    path of this page from the site root ("" | "cv.html")
 * @param {string} [opts.mirrorFile]  matching file inside a locale mirror ("" | "cv.html")
 * @param {boolean} [opts.noindex]    emit <meta name="robots" content="noindex">
 * @param {boolean} [opts.shareable]  emit canonical + hreflang + OG + Twitter
 */
export function renderHead(pageKey, { pagePath = "", mirrorFile = "", noindex = false, shareable = true } = {}) {
  const p = PAGES[pageKey];
  if (!p) throw new Error(`renderHead: no PAGES entry for "${pageKey}"`);

  const lines = [];
  lines.push(`<title>${escapeHtml(p.title)}</title>`);
  lines.push(`<meta name="description" content="${escapeHtml(p.description)}">`);
  if (noindex) lines.push(`<meta name="robots" content="noindex">`);
  lines.push(`<meta name="theme-color" content="${SITE.themeColor}">`);

  if (shareable) {
    const url = siteUrl(pagePath);
    const image = siteUrl(p.ogImage);
    lines.push(`<link rel="canonical" href="${url}">`);
    lines.push(...alternateLinks(pagePath, mirrorFile));
    lines.push(`<meta property="og:type" content="website">`);
    lines.push(`<meta property="og:site_name" content="${escapeHtml(SITE.baseUrl.replace(/^https?:\/\//, ""))}">`);
    lines.push(`<meta property="og:locale" content="${defaultLocale.ogLocale}">`);
    lines.push(`<meta property="og:title" content="${escapeHtml(p.ogTitle)}">`);
    lines.push(`<meta property="og:description" content="${escapeHtml(p.description)}">`);
    lines.push(`<meta property="og:image" content="${image}">`);
    lines.push(`<meta property="og:url" content="${url}">`);
    lines.push(`<meta name="twitter:card" content="${p.twitterCard}">`);
    lines.push(`<meta name="twitter:title" content="${escapeHtml(p.ogTitle)}">`);
    lines.push(`<meta name="twitter:description" content="${escapeHtml(p.description)}">`);
    lines.push(`<meta name="twitter:image" content="${image}">`);
  }

  for (const i of ICONS) {
    const type = i.type ? ` type="${i.type}"` : "";
    lines.push(`<link rel="${i.rel}"${type} sizes="${i.sizes}" href="${rootPath(i.file)}">`);
  }
  lines.push(`<link rel="manifest" href="${rootPath("site.webmanifest")}">`);

  return lines.join("\n");
}
