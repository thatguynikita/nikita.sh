/* ================================================================
   scripts/lib/locales.mjs — loads content/locales/*.mjs and checks
   that they agree.

   Locale files are imported by the explicit list in site.config.mjs,
   never by reading the directory: readdir order differs between macOS
   and CI, and a stray file would silently become a language.

   The parity check is the point of this module. Before it, a key
   missing from ru.mjs printed the literal text "undefined" into the
   terminal for Russian visitors — no error, no failed build, nothing
   in the diff. Now the default locale's key set is canonical and any
   disagreement fails the build with the paths listed.
   ================================================================ */

import { localeCodes, defaultLocale } from "./site-urls.mjs";

/** Every leaf path in an object, as "a.b.c" — arrays count as leaves. */
function keyPaths(value, prefix = "", out = []) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    out.push(prefix);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    keyPaths(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/**
 * @returns {Promise<Record<string, object>>} locale code -> its strings
 */
export async function loadLocales() {
  const locales = {};
  for (const code of localeCodes) {
    const url = new URL(`../../content/locales/${code}.mjs`, import.meta.url);
    let mod;
    try {
      mod = await import(url);
    } catch (err) {
      throw new Error(
        `site.config.mjs lists locale "${code}" but content/locales/${code}.mjs ` +
          `could not be loaded. Copy content/locales/${defaultLocale.code}.mjs and ` +
          `translate it.\n  ${err.message}`
      );
    }
    if (!mod.default || typeof mod.default !== "object") {
      throw new Error(`content/locales/${code}.mjs must have a default export object.`);
    }
    locales[code] = mod.default;
  }

  checkParity(locales);
  return locales;
}

function checkParity(locales) {
  const base = defaultLocale.code;
  const expected = keyPaths(locales[base]);
  const expectedSet = new Set(expected);
  const problems = [];

  for (const code of Object.keys(locales)) {
    if (code === base) continue;
    const actual = new Set(keyPaths(locales[code]));
    for (const path of expected) {
      if (!actual.has(path)) problems.push(`  ${code}.mjs: missing "${path}"`);
    }
    for (const path of actual) {
      if (!expectedSet.has(path)) problems.push(`  ${code}.mjs: has "${path}", which ${base}.mjs doesn't`);
    }
  }

  if (problems.length) {
    throw new Error(
      `content/locales/*.mjs disagree with ${base}.mjs (${problems.length} problems).\n` +
        `${base}.mjs is canonical — every other locale must have exactly its keys.\n\n` +
        problems.join("\n")
    );
  }
}
