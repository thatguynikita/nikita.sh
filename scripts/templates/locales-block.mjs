/* ================================================================
   scripts/templates/locales-block.mjs — the GENERATED:LOCALES block
   each page carries.

   The pages need to know two things about languages at runtime: which
   codes are valid (to validate a stored preference, or a `lang xx`
   argument), and what to label the switcher. Both were hardcoded as
   `'ru'`/`'en'` literals in seven places across three pages plus
   theme.js, which is what made "English-only" impossible without
   editing HTML.

   `code`, `label` and `name` are emitted. `name` is the language's
   endonym, derived from the code via Intl.DisplayNames at build time —
   the switcher's aria-label needs to name the language it switches to,
   and "Switch to Русский" generalises where "Switch to Russian" only
   works for one particular pair. `ogLocale` is not emitted: it only
   appears in <head>, which is generated, so the pages have no use for
   it.
   ================================================================ */

import { locales, languageEndonym } from "../lib/site-urls.mjs";

export function renderLocalesBlock(indent = "  ") {
  const rows = locales.map(
    (l) =>
      `${indent}  { code: ${JSON.stringify(l.code)}, label: ${JSON.stringify(l.label)}, ` +
      `name: ${JSON.stringify(languageEndonym(l.code))} },`
  );
  return `${indent}const LOCALES = [\n${rows.join("\n")}\n${indent}];`;
}
