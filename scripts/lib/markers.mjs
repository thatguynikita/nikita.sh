// Replaces the content between a GENERATED marker pair in place, leaving
// the marker comments themselves untouched. Two comment styles are used
// in the source files: JS block comments inside <script> tags, and HTML
// comments for the markers that sit directly in markup (each page's
// <head> block, plus cv.html's head JSON-LD).
//
// The marker comment names the file to edit, because that's the only
// instruction a reader of the page has. Most blocks come from
// content/site-data.mjs; GENERATED:I18N comes from content/locales/*.mjs,
// which is why `source` is a parameter and not baked into the string.

function markerRegex(name, style, source) {
  const [open, close] =
    style === "html"
      ? [`<!-- GENERATED:${name}:START — edit ${source}, then run scripts/build.mjs -->`, `<!-- GENERATED:${name}:END -->`]
      : [`/* GENERATED:${name}:START — edit ${source}, then run scripts/build.mjs */`, `/* GENERATED:${name}:END */`];
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(${escape(open)}\n)([\\s\\S]*?)(\n *${escape(close)})`);
}

export function replaceMarker(fileContent, name, newBody, { style = "js", source = "content/site-data.mjs" } = {}) {
  const re = markerRegex(name, style, source);
  if (!re.test(fileContent)) {
    throw new Error(`Marker GENERATED:${name} not found (style=${style}, source=${source})`);
  }
  return fileContent.replace(re, (_, open, _old, close) => `${open}${newBody}${close}`);
}
