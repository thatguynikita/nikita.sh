/* ================================================================
   scripts/lib/harvest-strings.mjs — pull every user-visible string
   literal out of a page's inline <script>.

   Used by two callers with opposite jobs: scripts/harvest-strings.mjs
   records a snapshot, scripts/check-strings.mjs asserts against one.

   Deliberately over-broad. It doesn't try to understand which literals
   are UI text and which are selectors or command names — it takes them
   all. The question it answers is only "did a string that used to be
   in this file stop existing anywhere", which is the failure mode of
   an i18n migration: a dropped or silently garbled line that no build
   check and no drift check would notice.
   ================================================================ */

// Single-quoted, double-quoted and backtick literals. Backticks are
// matched non-greedily and may span lines (several UI strings do).
const LITERAL = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

// Noise floor: one- and two-character literals are punctuation,
// separators and property keys, never translatable copy.
const MIN_LENGTH = 3;

/** Every distinct string literal in `source`, sorted. */
export function harvestStrings(source) {
  const found = new Set();
  for (const m of source.matchAll(LITERAL)) {
    const raw = m[1] ?? m[2] ?? m[3];
    if (raw === undefined) continue;
    if (raw.length < MIN_LENGTH) continue;
    found.add(raw);
  }
  return [...found].sort();
}

/** Every string value nested anywhere inside a locale object. */
export function collectLocaleStrings(value, out = new Set()) {
  if (typeof value === "string") {
    if (value.length >= MIN_LENGTH) out.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectLocaleStrings(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectLocaleStrings(v, out);
  }
  return out;
}
