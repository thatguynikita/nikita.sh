/* ================================================================
   scripts/templates/i18n.mjs — the GENERATED:I18N block each page
   carries: `const I18N = { <code>: { …that page's strings… } }`.

   Serialized with JSON.stringify rather than interpolated into a
   template literal. The other generated blocks are small enough to
   eyeball, but a hundred-odd strings of hand-written copy will
   eventually contain a backtick or a `${`, and interpolating those
   into a template literal breaks the page silently — not at build
   time, and not visibly in a diff.

   Each page gets only its own namespace ("terminal", "cv",
   "notFound"), an authored grouping rather than an inferred one, so
   404.html doesn't ship 56 fortunes to say "page not found".
   ================================================================ */

/**
 * @param {Record<string, object>} locales  code -> full locale object
 * @param {string} namespace                which slice this page needs
 * @param {string} [indent]                 leading whitespace to match the page
 */
export function renderI18n(locales, namespace, indent = "  ") {
  const slice = {};
  for (const [code, data] of Object.entries(locales)) {
    if (!(namespace in data)) {
      throw new Error(`content/locales/${code}.mjs has no "${namespace}" section.`);
    }
    slice[code] = data[namespace];
  }

  // "</script" inside a string would close the inline <script> block
  // early — the browser sees the page, not the JSON, so this is a
  // silent breakage rather than a parse error.
  const json = JSON.stringify(slice, null, 2).replace(/<\/script/gi, "<\\/script");

  // Indent every line to sit inside the page's IIFE, and pull the
  // opening brace up onto the declaration line.
  const body = json
    .split("\n")
    .map((line, i) => (i === 0 ? line : indent + line))
    .join("\n");

  return `${indent}const I18N = ${body};`;
}
