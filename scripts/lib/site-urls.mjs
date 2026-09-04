/* ================================================================
   scripts/lib/site-urls.mjs — every URL the build emits, derived from
   site.config.mjs.

   Before this existed the domain was written out ~100 times by hand
   across the pages, the mirror templates, jsonld.mjs and build.mjs's
   SITEMAP_URLS. This is the one place that knows how to turn a path
   into a URL, so changing `baseUrl`/`basePath`/`mirrors.path` is a
   one-line edit instead of a find/replace with three different
   meanings of "nikita.sh" in it.
   ================================================================ */

import { SITE } from "../../site.config.mjs";

const ORIGIN = SITE.baseUrl.replace(/\/+$/, "");
const PREFIX = SITE.basePath ? "/" + SITE.basePath.replace(/^\/+|\/+$/g, "") : "";
const MIRROR_SEG = SITE.mirrors.path.replace(/^\/+|\/+$/g, "");

export const locales = SITE.locales;
export const defaultLocale = SITE.locales[0];
export const localeCodes = SITE.locales.map((l) => l.code);
export const isDefaultLocale = (code) => code === defaultLocale.code;
export const localeByCode = (code) => SITE.locales.find((l) => l.code === code);

/**
 * A locale's language name, rendered in `inLocale` (default: the site's
 * own default locale). `languageName("ru")` is "Russian" on an
 * English-default site; `languageEndonym("ru")` is "Русский".
 *
 * Derived rather than configured: Intl.DisplayNames ships with Node's
 * bundled ICU, so a fork adding `{ code: "ja" }` gets "Japanese" and
 * "\u65e5\u672c\u8a9e" for free instead of filling in two more config fields.
 * Falls back to the bare code if ICU has no entry for it.
 */
export function languageName(code, inLocale = defaultLocale.code) {
  try {
    const name = new Intl.DisplayNames([inLocale], { type: "language" }).of(code);
    if (!name || name === code) return code;
    // ICU lower-cases endonyms in languages that don't capitalise them
    // ("\u0440\u0443\u0441\u0441\u043a\u0438\u0439"); these are used as headings, so title-case them.
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return code;
  }
}

/** A locale's name in itself — "English", "Русский", "Deutsch". */
export const languageEndonym = (code) => languageName(code, code);

/** Bare host for display/branding — "nikita.sh", no scheme. */
export const host = ORIGIN.replace(/^https?:\/\//, "") + PREFIX;

/** An absolute URL rendered as visible link text — scheme stripped. */
export const displayUrl = (u) => u.replace(/^https?:\/\//, "");

/**
 * Root-absolute path for something served out of public/ —
 * "/assets/x.png", or "/repo/assets/x.png" when basePath is set.
 * Use for href/src attributes, not for canonical/og URLs.
 */
export function rootPath(p = "") {
  return `${PREFIX}/${String(p).replace(/^\/+/, "")}`;
}

/**
 * Absolute public URL — "https://nikita.sh/cv.html". `siteUrl()` with
 * no argument is the homepage, with its trailing slash.
 */
export function siteUrl(p = "") {
  return ORIGIN + rootPath(p);
}

/**
 * Directory of a locale's crawler mirror, relative to the site root:
 * "llm/" for the default locale, "llm/ru/" for the rest.
 */
export function mirrorDir(code) {
  return isDefaultLocale(code) ? `${MIRROR_SEG}/` : `${MIRROR_SEG}/${code}/`;
}

/** Absolute URL of a file inside a locale's mirror. */
export const mirrorUrl = (code, file = "") => siteUrl(mirrorDir(code) + file);

/** Repo-relative path of a mirror file, for build.mjs's write()/git. */
export const mirrorPath = (code, file) => mirrorDir(code) + file;
