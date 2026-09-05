/* ================================================================
   scripts/lib/write-config.mjs — rewrite site.config.mjs in place.

   Targeted edits rather than regenerating the file, because every key
   in site.config.mjs carries a paragraph of explanation and those
   comments are the actual documentation for a forker. Regenerating
   would throw them away on the one run where they matter most.

   Pure: takes the file's text and an answers object, returns new text.
   That's what makes it testable — scripts/init.mjs is a pile of
   prompts wrapped around this function, and this is the part that can
   silently corrupt something.
   ================================================================ */

// Horizontal whitespace only. `\s` would also match the newlines around
// a line, and every one of these patterns is anchored per-line — letting
// it cross line boundaries silently deletes the blank lines that separate
// the config's commented sections, and drags the next `},` up onto the
// value it just rewrote. (Both of which it did, before this comment.)
const H = "[ \\t]";

/** Narrow `source` to the body of `key: { … }`, so nested keys are unambiguous. */
function blockRange(source, key) {
  const open = new RegExp(`^(${H}*)${key}:${H}*\\{${H}*$`, "m");
  const m = source.match(open);
  if (!m) throw new Error(`site.config.mjs: couldn't find a "${key}: {" block.`);
  const start = m.index + m[0].length;
  const indent = m[1];
  const close = new RegExp(`^${indent}\\},${H}*$`, "m");
  const rest = source.slice(start);
  const c = rest.match(close);
  if (!c) throw new Error(`site.config.mjs: couldn't find the end of the "${key}" block.`);
  return [start, start + c.index];
}

function replaceScalar(source, key, rendered, range) {
  const [from, to] = range ?? [0, source.length];
  const region = source.slice(from, to);
  const re = new RegExp(`^(${H}*${key}:${H}*).*?,${H}*$`, "m");
  if (!re.test(region)) throw new Error(`site.config.mjs: couldn't find a "${key}:" line to update.`);
  return source.slice(0, from) + region.replace(re, `$1${rendered},`) + source.slice(to);
}

const str = (v) => JSON.stringify(v);

/**
 * @param {string} source              current site.config.mjs text
 * @param {object} a                   answers
 * @param {string} a.baseUrl
 * @param {string} a.basePath
 * @param {string} a.terminalHost
 * @param {Array<{code,ogLocale,label}>} a.locales
 * @param {boolean} a.mirrorsEnabled
 * @param {boolean} a.gameEnabled
 * @param {string} a.gameUrl
 * @param {string} a.gameTitle
 * @param {string} a.deployTarget
 * @param {string} a.deployBucket
 * @returns {string} new site.config.mjs text
 */
export function applyConfig(source, a) {
  let out = source;

  out = replaceScalar(out, "baseUrl", str(a.baseUrl));
  out = replaceScalar(out, "basePath", str(a.basePath));
  out = replaceScalar(out, "terminalHost", str(a.terminalHost));

  // Scoped, so mirrors.enabled and game.enabled can't be confused with
  // each other — they're the same key name one block apart.
  out = replaceScalar(out, "enabled", String(a.mirrorsEnabled), blockRange(out, "mirrors"));
  out = replaceScalar(out, "enabled", String(a.gameEnabled), blockRange(out, "game"));
  out = replaceScalar(out, "url", str(a.gameUrl), blockRange(out, "game"));
  out = replaceScalar(out, "title", str(a.gameTitle), blockRange(out, "game"));
  out = replaceScalar(out, "target", str(a.deployTarget), blockRange(out, "deploy"));
  out = replaceScalar(out, "bucket", str(a.deployBucket), blockRange(out, "deploy"));

  // locales is an array of rows, not a scalar.
  {
    const re = /(\n( *)locales: \[\n)[\s\S]*?(\n\2\],)/;
    if (!re.test(out)) throw new Error("site.config.mjs: couldn't find the locales array.");
    out = out.replace(re, (_, head, indent, tail) => {
      const rows = a.locales
        .map((l) => `${indent}  { code: ${str(l.code)}, ogLocale: ${str(l.ogLocale)}, label: ${str(l.label)} },`)
        .join("\n");
      return head + rows + tail;
    });
  }

  return out;
}

/** A locale row for a code the current config doesn't have. */
export function defaultLocaleRow(code) {
  return { code, ogLocale: `${code}_${code.toUpperCase()}`, label: code.toUpperCase() };
}
